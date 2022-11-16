import { GenericClient, RPCClient } from '../types'
import { ClientReadableStream, credentials, Metadata, ServiceError } from '@grpc/grpc-js'
import {
  AssetId,
  CalculateAssetIdRequest,
  CommitExecutionResponse,
  ContractBalancesRequest,
  ContractBalancesResponse,
  ContractKeyRequest,
  ContractKeyResponse,
  ContractKeysRequest,
  ContractKeysResponse,
  ContractServiceClient,
  ContractTransactionResponse,
  ExecutionErrorRequest,
  ExecutionSuccessRequest,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { logger } from '../../api'
import { UnavailableStateKeyException } from '../../execution'
import { ApiErrors } from '../../execution/constants'

export type IContractClient = GenericClient<Omit<ContractServiceClient, 'connect'>>

export class ContractClient implements IContractClient {
  log = logger(this)

  impl: ContractServiceClient

  connection: ClientReadableStream<ContractTransactionResponse>

  constructor(private rpc: RPCClient) {
    this.impl = new ContractServiceClient(
      this.rpc.getConfig().address,
      credentials.createInsecure(),
    )
  }

  connect() {
    this.connection = this.impl.connect(
      {
        connectionId: this.rpc.getConfig().connectionId(),
      },
      this.getConnectionMetadata(),
    )

    this.applyHandlers(this.connection)
  }

  getContractKey(req: ContractKeyRequest) {
    return new Promise<ContractKeyResponse>((resolve, reject) => {
      this.impl.getContractKey(req, this.rpc.getAuth(), (err: ServiceError, resp: ContractKeyResponse) => {
        if (!err) {
          return resolve(resp)
        }

        const { metadata } = err
        const [errorCode] = metadata.get('error-code')

        if (ApiErrors.DataKeyNotExists === +errorCode) {
          reject(new UnavailableStateKeyException(`Empty state entry ${req.key}`))

          return
        }

        reject(err)
      })
    })
  }

  getContractKeys(req: Partial<ContractKeysRequest>) {
    return this.internalCall<ContractKeysResponse>((handler) =>
      this.impl.getContractKeys(ContractKeysRequest.fromPartial(req), this.rpc.getAuth(), handler),
    )
  }

  commitExecutionSuccess(req: ExecutionSuccessRequest) {
    return this.internalCall<CommitExecutionResponse>((handler) =>
      this.impl.commitExecutionSuccess(req, this.rpc.getAuth(), handler),
    )
  }

  commitExecutionError(req: ExecutionErrorRequest) {
    return this.internalCall<CommitExecutionResponse>((handler) =>
      this.impl.commitExecutionError(req, this.rpc.getAuth(), handler),
    )
  }

  getContractBalances(req: ContractBalancesRequest) {
    return new Promise<ContractBalancesResponse>((resolve, reject) => {
      this.impl.getContractBalances(req, this.rpc.getAuth(), (err: ServiceError, resp: ContractBalancesResponse) => {
        if (!err) {
          return resolve(resp)
        }

        const { metadata } = err
        const [errorCode] = metadata.get('error-code')

        if (ApiErrors.DataKeyNotExists === +errorCode) {
          reject(new UnavailableStateKeyException(`Empty response for ${req.assetsIds}`))

          return
        }

        reject(err)
      })
    })
  }

  calculateAssetId(req: CalculateAssetIdRequest) {
    return new Promise<AssetId>((resolve, reject) => {
      this.impl.calculateAssetId(req, this.rpc.getAuth(), (err: ServiceError, resp: AssetId) => {
        if (!err) {
          return resolve(resp)
        }

        const { metadata } = err
        const [errorCode] = metadata.get('error-code')

        if (ApiErrors.DataKeyNotExists === +errorCode) {
          reject(new UnavailableStateKeyException(`Empty response for ${req.nonce}`))

          return
        }

        reject(err)
      })
    })
  }

  addResponseHandler(handler: (r: ContractTransactionResponse) => void) {
    if (!this.connection) {
      throw new Error('Connection closed or not opened')
    }

    this.connection.on('data', handler)
  }

  private internalCall<R>(fn: (h: (e: ServiceError, r: R) => void) => void) {
    return new Promise<R>((resolve, reject) => {
      const handler = (err: ServiceError, resp: R) => {
        if (!err) {
          return resolve(resp)
        }

        const { metadata } = err
        const [errorCode] = metadata.get('error-code')

        if (ApiErrors.DataKeyNotExists === +errorCode) {
          reject(new UnavailableStateKeyException('Key'))

          return
        }

        reject(err)
      }

      fn(handler)
    })
  }

  private getConnectionMetadata() {
    const connectionMeta = new Metadata()

    connectionMeta.set('authorization', this.rpc.getConfig().connectionToken())

    return connectionMeta
  }

  private applyHandlers(conn: ClientReadableStream<ContractTransactionResponse>) {
    conn.on('close', () => {
      this.log.verbose('Connection stream closed')
    })
    conn.on('end', () => {
      this.log.verbose('Connection stream ended')
    })
    conn.on('error', (error) => {
      this.log.verbose('Connection stream error: ', error)
    })
    conn.on('readable', () => {
      this.log.verbose('Connection stream readable')
      this.connection.read()
    })
    conn.on('pause', () => {
      this.log.verbose('Connection stream paused')
    })
    conn.on('resume', () => {
      this.log.verbose('Connection stream resume')
    })

    this.log.verbose('RPC connection created')
  }
}
