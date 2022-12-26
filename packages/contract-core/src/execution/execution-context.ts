import { ContractState } from '../api'
import { IncomingTx } from './types'
import { ContractTransactionResponse } from '@wavesenterprise/we-node-grpc-api'
import { convertContractTransaction } from './converter'
import { GrpcClient } from '../grpc/grpc-client'

export class ExecutionContext {
  private nonce = 0
  readonly tx: IncomingTx
  readonly state: ContractState

  constructor(
    private incomingTxResp: ContractTransactionResponse,
    readonly grpcClient: GrpcClient,
  ) {

    this.tx = convertContractTransaction(incomingTxResp.transaction)
    this.state = new ContractState(this)
  }

  getNonce() {
    this.nonce = this.nonce + 1

    return this.nonce
  }

  get txId(): string {
    return this.tx.id
  }

  get contractId(): string {
    return this.tx.contractId
  }

  get params(): Map<string, string> {
    const paramsMap = new Map()

    for (const p of this.tx.params) {
      paramsMap.set(p.key, p.value)
    }

    return paramsMap
  }
}
