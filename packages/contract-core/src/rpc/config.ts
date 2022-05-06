export const CONNECTION_ID = process.env.CONNECTION_ID || '';
export const CONNECTION_TOKEN = process.env.CONNECTION_TOKEN || '';
export const NODE = process.env.NODE || '';
export const NODE_PORT = process.env.NODE_PORT || '';
export const HOST_NETWORK = process.env.HOST_NETWORK || '';

// export const IS_TESTING_ENV = envs.error === undefined ? envs?.parsed?.IS_TESTING_ENV : false

export class RPCConnectionConfig {
    constructor(
        private _connectionId: string,
        private _connectionToken: string,
        private _node: string,
        private _nodePort: string,
    ) {}

    public connectionId() {
        return this._connectionId;
    }

    public connectionToken() {
        return this._connectionToken;
    }

    public node() {
        return this._node;
    }

    public nodePort() {
        return this._nodePort;
    }
}

export const envConfig = (): RPCConnectionConfig => {
    return new RPCConnectionConfig(CONNECTION_ID, CONNECTION_TOKEN, NODE, NODE_PORT);
};
