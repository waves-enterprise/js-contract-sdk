import {ContractProcessor} from "../../execution/contract-processor";
import {ContractTransactionResponse} from "@wavesenterprise/we-node-grpc-api/src/types";
import {LocalGrpcClient} from "./local";

export class LocalContractProcessor extends ContractProcessor {
  async handleIncomingTx(resp: ContractTransactionResponse): Promise<unknown> {
    this.prevalidatePayments(resp);
    this.assignContractBalance(resp)

    return super.handleIncomingTx(resp);
  }

  prevalidatePayments(resp: ContractTransactionResponse) {
    if (resp.transaction.payments.length === 0) {
      return
    }

    const assetsStore = (this.grpcClient as LocalGrpcClient).assets

    for (const r of resp.transaction.payments) {
      const isValid = assetsStore.canTransfer(resp.transaction.sender, r.amount)

      if (!isValid) {

        throw new Error('not valid payment attached')
      }
    }
  }


  assignContractBalance(resp: ContractTransactionResponse) {
    if (resp.transaction.payments.length === 0) {
      return
    }

    const assetsStore = (this.grpcClient as LocalGrpcClient).assets

    for (const r of resp.transaction.payments) {

      assetsStore.transfer(resp.transaction.sender, resp.transaction.contractId, r.amount)
    }
  }

}