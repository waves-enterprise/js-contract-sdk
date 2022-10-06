import { ContractState } from '../state'
import { AssetOperationsRegistry } from '../assets/asset-operations-registry'
import { Auth } from './auth'

import { RPC } from '../../grpc'
import { IncomingTransactionResp } from '../types/core'

export class ExecutionContext {
    private nonce = 0

    state: ContractState
    private auth: Auth

    constructor(
      public incomingTxResp: IncomingTransactionResp,
      public rpcConnection: RPC,
      public assetOperations: AssetOperationsRegistry = new AssetOperationsRegistry(),
    ) {
      this.state = new ContractState(this)

      this.auth = new Auth(incomingTxResp.authToken)
      this.rpcConnection.Contract.setAuth(this.auth.metadata())
    }


    getNonce() {
      this.nonce = this.nonce + 1

      return this.nonce
    }

    get tx() {
      return this.incomingTxResp.tx
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