import {
  ContractAddressService,
  ContractPermissionService,
  ContractPKIService,
  ContractPrivacyService,
  ContractService,
  ContractTransactionService,
  ContractUtilService,
} from '@wavesenterprise/we-node-grpc-api'
import { MetadataValue } from '@grpc/grpc-js'

export type GrpcClientProps = {
  connectionToken: string,
  nodeAddress: string,
}

export class GrpcClient {
  readonly contractService: ContractService
  readonly contractAddressService: ContractAddressService
  readonly contractUtilService: ContractUtilService
  readonly contractPermissionService: ContractPermissionService
  readonly contractPKIService: ContractPKIService
  readonly contractPrivacyService: ContractPrivacyService
  readonly contractTransactionService: ContractTransactionService

  constructor(private readonly props: GrpcClientProps) {
    this.contractService = new ContractService(this.props.nodeAddress)
    this.contractAddressService = new ContractAddressService(this.props.nodeAddress)
    this.contractUtilService = new ContractUtilService(this.props.nodeAddress)
    this.contractPermissionService = new ContractPermissionService(this.props.nodeAddress)
    this.contractPKIService = new ContractPKIService(this.props.nodeAddress)
    this.contractPrivacyService = new ContractPrivacyService(this.props.nodeAddress)
    this.contractTransactionService = new ContractTransactionService(this.props.nodeAddress)
    this.setMetadata({
      authorization: this.props.connectionToken,
    })
  }

  setMetadata(metadata: Record<string, MetadataValue>) {
    this.contractService.setMetadata(metadata)
    this.contractAddressService.setMetadata(metadata)
    this.contractUtilService.setMetadata(metadata)
    this.contractPermissionService.setMetadata(metadata)
    this.contractPKIService.setMetadata(metadata)
    this.contractPrivacyService.setMetadata(metadata)
    this.contractTransactionService.setMetadata(metadata)
  }

}
