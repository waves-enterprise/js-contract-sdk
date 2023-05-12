import {
  ContractAssetOperation,
  ContractBurn,
  ContractCancelLease,
  ContractIssue,
  ContractLease,
  ContractReissue,
  ContractTransferOut,
} from '@wavesenterprise/we-node-grpc-api'

export class AssetsStorage {

  private readonly operations: ContractAssetOperation[] = []

  addIssue(operation: ContractIssue) {
    this.operations.push({
      contractIssue: operation,
    })
  }

  addReissue(operation: ContractReissue) {
    this.operations.push({
      contractReissue: operation,
    })
  }

  addBurn(operation: ContractBurn) {
    this.operations.push({
      contractBurn: operation,
    })
  }

  addTransfer(operation: ContractTransferOut) {
    this.operations.push({
      contractTransferOut: operation,
    })
  }

  addLease(operation: ContractLease) {
    this.operations.push({
      contractLease: operation,
    })
  }

  addCancelLease(operation: ContractCancelLease) {
    this.operations.push({
      contractCancelLease: operation,
    })
  }

  getOperations() {
    return this.operations
  }
}
