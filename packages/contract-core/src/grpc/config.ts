export const CONNECTION_ID = process.env.CONNECTION_ID || ''
export const CONNECTION_TOKEN = process.env.CONNECTION_TOKEN || ''
export const NODE = process.env.NODE || ''
export const NODE_PORT = process.env.NODE_PORT || ''
export const HOST_NETWORK = process.env.HOST_NETWORK || ''

export class RPCConnectionConfig {
  constructor(
    private _connectionId: string,
    private _connectionToken: string,
    private _node: string,
    private _nodePort: string,
  ) {}

  connectionId() {
    return this._connectionId
  }

  connectionToken() {
    return this._connectionToken
  }

  node() {
    return this._node
  }

  nodePort() {
    return this._nodePort
  }

  get address() {
    return `${this.node()}:${this.nodePort()}`
  }
}

export const envConfig = (): RPCConnectionConfig => {
  return new RPCConnectionConfig(CONNECTION_ID, CONNECTION_TOKEN, NODE, NODE_PORT)
}
