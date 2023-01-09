import {
  ContractAssetOperation,
  ContractBurn,
  ContractIssue,
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

  getOperations() {
    return this.operations
  }
}
