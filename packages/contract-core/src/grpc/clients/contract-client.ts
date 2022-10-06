import { GenericClient } from '../types'
import { RPCConnectionConfig } from '../config'
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
import { logger } from '../../core/common/logger'
import { ApiErrors } from '../../core/types/errors'
import { UnavailableStateKeyException } from '../../core/exceptions'

export type IContractClient = GenericClient<Omit<ContractServiceClient, 'connect'>>

export class ContractClient implements IContractClient {
    log = logger(this)

    private auth: Metadata
    impl: ContractServiceClient

    connection: ClientReadableStream<ContractTransactionResponse>

    constructor(private config: RPCConnectionConfig) {
      this.impl = new ContractServiceClient(
        this.config.address,
        credentials.createInsecure(),
      )
    }

    connect() {
      this.connection = this.impl.connect(
        {
          connectionId: this.config.connectionId(),
        },
        this.getConnectionMetadata(),
      )

      this.applyHandlers(this.connection)
    }

    setAuth(auth: Metadata) {
      this.auth = auth
    }

    getContractKey(req: ContractKeyRequest) {
      return new Promise<ContractKeyResponse>((resolve, reject) => {
        this.impl.getContractKey(req, this.auth, (err: ServiceError, resp: ContractKeyResponse) => {
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
        this.impl.getContractKeys(ContractKeysRequest.fromPartial(req), this.auth, handler),
      )
    }

    commitExecutionSuccess(req: ExecutionSuccessRequest) {
      return this.internalCall<CommitExecutionResponse>((handler) =>
        this.impl.commitExecutionSuccess(req, this.auth, handler),
      )
    }

    commitExecutionError(req: ExecutionErrorRequest) {
      return this.internalCall<CommitExecutionResponse>((handler) =>
        this.impl.commitExecutionError(req, this.auth, handler),
      )
    }

    getContractBalances(req: ContractBalancesRequest) {
      return new Promise<ContractBalancesResponse>((resolve, reject) => {
        this.impl.getContractBalances(req, this.auth, (err: ServiceError, resp: ContractBalancesResponse) => {
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
        this.impl.calculateAssetId(req, this.auth, (err: ServiceError, resp: AssetId) => {
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

      connectionMeta.set('authorization', this.config.connectionToken())

      return connectionMeta
    }

    private applyHandlers(conn: ClientReadableStream<ContractTransactionResponse>) {
      conn.on('close', () => {
        this.log.info('Connection stream closed')
      })
      conn.on('end', () => {
        this.log.info('Connection stream ended')
      })
      conn.on('error', (error) => {
        this.log.info('Connection stream error: ', error)
      })
      conn.on('readable', () => {
        this.log.info('Connection stream readable')
        this.connection.read()
      })
      conn.on('pause', () => {
        this.log.info('Connection stream paused')
      })
      conn.on('resume', () => {
        this.log.info('Connection stream resume')
      })

      this.log.info('RPC connection created')
    }
}
