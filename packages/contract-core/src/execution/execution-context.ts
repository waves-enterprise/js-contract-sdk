import {ContractState} from '../api'
import {BlockInfo, IncomingTx} from './types'
import {ContractTransactionResponse} from '@wavesenterprise/we-node-grpc-api'
import {convertBlockInfo, convertContractTransaction} from './converter'
import {IGrpcClient} from '../grpc/grpc-client'
import {AssetsStorage} from '../api/assets/assets-storage'

export class ExecutionContext {
  readonly tx: IncomingTx
  readonly state: ContractState
  readonly assets: AssetsStorage
  readonly blockInfo: BlockInfo

  constructor(
    private incomingTxResp: ContractTransactionResponse,
    readonly grpcClient: IGrpcClient,
  ) {

    this.tx = convertContractTransaction(incomingTxResp.transaction)
    this.blockInfo = convertBlockInfo(incomingTxResp.currentBlockInfo)
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
