import { IAddressService, IContractService, IGrpcClient } from '../../grpc/grpc-client'
import {
  AssetBalanceResponse,
  ContractBalanceResponse,
  ContractTransactionResponse,
  DataEntry,
} from '@wavesenterprise/we-node-grpc-api/src/types'
import {
  CalculateAssetIdRequest,
  ConnectionRequest,
  ContractBalancesRequest,
  ContractKeyRequest,
  ContractKeysRequest,
  ExecutionErrorRequest,
  ExecutionSuccessRequest,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { ClientReadableStream, MetadataValue } from '@grpc/grpc-js'
import { AddressDataRequest } from '@wavesenterprise/js-contract-grpc-client/address/address_public_service'
import { AssetBalanceRequest } from '@wavesenterprise/js-contract-grpc-client/contract/contract_address_service'
import { IBlockchainState, LocalAssets } from './local-contract-state'
import { _parseDataEntry, getValueStateKey, isUndefined } from '../../utils'
import { TVal } from '../../intefaces/contract'
import Long from 'long'
import { ContractIssue } from '@wavesenterprise/we-node-grpc-api'

function makeid(length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

export class LocalContractService implements IContractService {
  protected metadata?: Record<string, MetadataValue>

  constructor(private client: LocalGrpcClient) {
  }

  getContractBalances(request: ContractBalancesRequest): Promise<ContractBalanceResponse[]> {
    throw new Error('not implemented')
  }

  getContractKey(request: ContractKeyRequest): Promise<DataEntry> {
    const resp = this.client.state.getKeys([request.key as string])
    const value = resp[0]

    if (isUndefined(value)) {
      return Promise.resolve(undefined as any as DataEntry)
    }

    const valueKey = getValueStateKey(value)

    return Promise.resolve(
      {
        key: request.key as string,
        [valueKey]: value,
      } as DataEntry,
    )
  }

  getContractKeys(request: ContractKeysRequest): Promise<DataEntry[]> {
    return Promise.all(request.keysFilter!.keys!.map(
      (k) => this.getContractKey({ key: k as string }),
    ))
  }

  connect(request: ConnectionRequest): ClientReadableStream<ContractTransactionResponse> {
    throw new Error('not implemented')
  }

  commitExecutionSuccess(request: ExecutionSuccessRequest): Promise<void> {
    if (!request.results || !request.assetOperations) {
      return Promise.reject('keys not changed')
    }

    for (const res of request.results) {
      const value = _parseDataEntry(res as DataEntry)

      this.client.state.setKey(res.key as string, value as TVal)
    }

    for (const res of request.assetOperations) {
      if (res.contractTransferOut) {
        this.client.assets.transfer(
          this.client.contractId,
          res.contractTransferOut.recipient!,
          res.contractTransferOut.amount as Long,
          res.contractTransferOut.assetId,
        )
      }
      if (res.contractIssue) {
        this.client.assets.issue(res.contractIssue as ContractIssue, this.client.contractId)
      }
    }


    // TODO asset operations

    return Promise.resolve()
  }


  commitExecutionError(request: ExecutionErrorRequest): Promise<void> {

    return Promise.reject(request.message)
  }

  calculateAssetId(request: CalculateAssetIdRequest): Promise<string> {
    return Promise.resolve(makeid(32))
  }

  setMetadata(metadata: Record<string, MetadataValue>) {
    this.metadata = metadata
  }
}

export class LocalAddressService implements IAddressService {
  constructor(private client: IGrpcClient) {
  }

  protected metadata?: Record<string, MetadataValue>

  getAddresses(): Promise<string[]> {
    throw new Error('not implemented')
  }

  getAssetBalance(request: AssetBalanceRequest): Promise<AssetBalanceResponse> {
    throw new Error('not implemented')
  }

  getAddressData(request: AddressDataRequest): Promise<DataEntry[]> {
    throw new Error('not implemented')
  }

  setMetadata(metadata: Record<string, MetadataValue>) {
    this.metadata = metadata
  }
}

export class LocalGrpcClient implements IGrpcClient {
  contractService = new LocalContractService(this)
  contractAddressService = new LocalAddressService(this)

  constructor(
    public state: IBlockchainState,
    public assets: LocalAssets,
    public contractId: string,
  ) {
  }

  setMetadata(metadata: Record<string, MetadataValue>) {
    this.contractService.setMetadata(metadata)
    this.contractAddressService.setMetadata(metadata)
  }
}

