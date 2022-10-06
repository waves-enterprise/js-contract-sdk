import { ContractClient } from "./clients/contract-client";
import { RPCConnectionConfig, envConfig } from "./config";

export { RPCConnectionConfig, ContractClient, envConfig };

export class RPC {
    clients = {};

    public get Contract() {
        return (this.clients as any).contract as ContractClient;
    }

    constructor(private config: RPCConnectionConfig) {
        this.addClient("contract", ContractClient);
    }

    addClient(key: string, constructor: any) {
        this.clients[key] = new constructor(this.config);
    }
}
