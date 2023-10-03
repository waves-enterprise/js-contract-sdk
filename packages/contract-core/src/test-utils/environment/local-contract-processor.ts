import { ContractProcessor } from '../../execution/contract-processor'
import { ContractTransactionResponse } from '@wavesenterprise/we-node-grpc-api/src/types'
import { LocalGrpcClient } from './local'

export class LocalContractProcessor extends ContractProcessor {
  get client() {
    return this.grpcClient as LocalGrpcClient
  }

  handleIncomingTx(resp: ContractTransactionResponse): Promise<unknown> {
    this.validateBalances(resp)

    return super.handleIncomingTx(resp)
  }

  validateBalances(resp: ContractTransactionResponse) {
    if (resp.transaction.payments.length === 0) {
      return
    }

    for (const r of resp.transaction.payments) {
      const isValid = this.client.assets.canTransfer(resp.transaction.sender, r.amount)

      if (!isValid) {
        throw new Error('not valid payment attached')
      }

      this.client.assets.transfer(resp.transaction.sender, resp.transaction.contractId, r.amount)
    }
  }
}
