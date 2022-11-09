import { AssetOperationsRegistry, ContractState } from '../api'
import { RPC } from '../grpc'
import { IncomingTransactionResp, IncomingTx } from './types'
import { Metadata } from '@grpc/grpc-js'
import { ContractTransaction } from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { convertContractTransaction } from './converter'

export class Auth {
  constructor(private readonly _authToken: string) {
  }

  authToken() {
    return this._authToken
  }

  metadata(): Metadata {
    const metadata = new Metadata()

    metadata.set('authorization', this._authToken)

    return metadata
  }
}

export class ExecutionContext {
  private nonce = 0
  private incomingTransaction: IncomingTx

  state: ContractState
  private auth: Auth

  constructor(
    private incomingTxResp: IncomingTransactionResp,
    public rpcConnection: RPC,
    public assetOperations: AssetOperationsRegistry = new AssetOperationsRegistry(),
  ) {

    this.incomingTransaction = convertContractTransaction(ContractTransaction.fromJSON(incomingTxResp.tx))
    this.state = new ContractState(this)
    this.auth = new Auth(incomingTxResp.authToken)
    this.rpcConnection.Contract.setAuth(this.auth.metadata())
  }

  getNonce() {
    this.nonce = this.nonce + 1

    return this.nonce
  }

  get tx() {
    return this.incomingTransaction
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