import { ContractState } from '../api'
import { IncomingTx } from './types'
import { ContractTransactionResponse } from '@wavesenterprise/we-node-grpc-api'
import { convertContractTransaction } from './converter'
import { GrpcClient } from '../grpc/grpc-client'
import { AssetsStorage } from '../api/assets/assets-storage'

export class ExecutionContext {
  readonly tx: IncomingTx
  readonly state: ContractState
  readonly assets: AssetsStorage

  constructor(
    private incomingTxResp: ContractTransactionResponse,
    readonly grpcClient: GrpcClient,
  ) {

    this.tx = convertContractTransaction(incomingTxResp.transaction)
    this.state = new ContractState(this)
    this.assets = new AssetsStorage()
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
