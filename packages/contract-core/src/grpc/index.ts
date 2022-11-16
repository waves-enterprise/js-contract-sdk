import { ContractClient } from './clients/contract-client'
import { RPCConnectionConfig, envConfig } from './config'

export class RPC {
  contractClient: ContractClient

  get Contract() {
    return this.contractClient
  }

  constructor(private config: RPCConnectionConfig) {
    this.saveClient()
  }

  saveClient() {
    this.contractClient = new ContractClient(this.config)
  }
}

export { RPCConnectionConfig, envConfig, ContractClient }
