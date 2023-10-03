import { ContractAddressService, ContractService } from '@wavesenterprise/we-node-grpc-api'
import { ClientReadableStream, MetadataValue } from '@grpc/grpc-js'
import {
  CalculateAssetIdRequest,
  ConnectionRequest,
  ContractBalancesRequest,
  ContractKeyRequest,
  ContractKeysRequest,
  ExecutionErrorRequest,
  ExecutionSuccessRequest,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import {
  AssetBalanceResponse,
  ContractBalanceResponse,
  ContractTransactionResponse,
  DataEntry,
} from '@wavesenterprise/we-node-grpc-api/src/types'
import {
  AddressDataRequest,
  AssetBalanceRequest,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_address_service'

export type GrpcClientProps = {
  connectionToken: string,
  nodeAddress: string,
}


export type IContractService = {
  connect(request: ConnectionRequest): ClientReadableStream<ContractTransactionResponse>,

  commitExecutionSuccess(request: ExecutionSuccessRequest): Promise<void>,

  commitExecutionError(request: ExecutionErrorRequest): Promise<void>,

  getContractKeys(request: ContractKeysRequest): Promise<DataEntry[]>,

  getContractKey(request: ContractKeyRequest): Promise<DataEntry>,

  getContractBalances(request: ContractBalancesRequest): Promise<ContractBalanceResponse[]>,

  calculateAssetId(request: CalculateAssetIdRequest): Promise<string>,

  setMetadata(metadata: Record<string, MetadataValue>),
}

export type IAddressService = {
  getAddresses(): Promise<string[]>,

  getAddressData(request: AddressDataRequest): Promise<DataEntry[]>,

  getAssetBalance(request: AssetBalanceRequest): Promise<AssetBalanceResponse>,

  setMetadata(metadata: Record<string, MetadataValue>),
}

export type IGrpcClient = {
  contractService: IContractService,
  contractAddressService: IAddressService,

  setMetadata(metadata: Record<string, MetadataValue>): void,
}


export class GrpcClient implements IGrpcClient {
  readonly contractService: IContractService
  readonly contractAddressService: IAddressService
  // readonly contractUtilService: ContractUtilService
  // readonly contractPermissionService: ContractPermissionService
  // readonly contractPKIService: ContractPKIService
  // readonly contractPrivacyService: ContractPrivacyService
  // readonly contractTransactionService: ContractTransactionService

  constructor(private readonly props: GrpcClientProps) {
    this.contractService = new ContractService(this.props.nodeAddress)
    this.contractAddressService = new ContractAddressService(this.props.nodeAddress)
    // this.contractUtilService = new ContractUtilService(this.props.nodeAddress)
    // this.contractPermissionService = new ContractPermissionService(this.props.nodeAddress)
    // this.contractPKIService = new ContractPKIService(this.props.nodeAddress)
    // this.contractPrivacyService = new ContractPrivacyService(this.props.nodeAddress)
    // this.contractTransactionService = new ContractTransactionService(this.props.nodeAddress)
    this.setMetadata({
      authorization: this.props.connectionToken,
    })
  }

  setMetadata(metadata: Record<string, MetadataValue>) {
    this.contractService.setMetadata(metadata)
    this.contractAddressService.setMetadata(metadata)
    // this.contractUtilService.setMetadata(metadata)
    // this.contractPermissionService.setMetadata(metadata)
    // this.contractPKIService.setMetadata(metadata)
    // this.contractPrivacyService.setMetadata(metadata)
    // this.contractTransactionService.setMetadata(metadata)
  }

}
