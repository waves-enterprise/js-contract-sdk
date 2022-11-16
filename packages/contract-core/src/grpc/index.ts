import { ContractClient } from './clients/contract-client'
import { envConfig, RPCConnectionConfig } from './config'
import { AddressClient } from './clients/address-client'
import { Metadata } from '@grpc/grpc-js'
import { RPCClient } from './types'

export class RPC implements RPCClient {
  contractClient: ContractClient
  addressClient: AddressClient

  private auth: Metadata

  get Address() {
    return this.addressClient
  }

  get Contract() {
    return this.contractClient
  }

  constructor(private config: RPCConnectionConfig) {
    this.contractClient = new ContractClient(this)
    this.addressClient = new AddressClient(this)
  }

  getConfig() {
    return this.config
  }

  getAuth(): Metadata {
    return this.auth
  }

  setAuth(auth: Metadata) {
    this.auth = auth
  }
}

export { RPCConnectionConfig, envConfig, ContractClient, AddressClient }
