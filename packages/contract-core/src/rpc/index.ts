import {ContractClient} from "./clients/contract-client";
import {Config} from "./config";

export class RPC {
    clients = {}

    public get Contract() {
        return (this.clients as any).contract as ContractClient;
    }

    constructor(private config: Config) {

        this.addClient('contract', ContractClient);
    }

    addClient(key: string, constructor: any) {
        this.clients[key] = new constructor(this.config);
    }
}