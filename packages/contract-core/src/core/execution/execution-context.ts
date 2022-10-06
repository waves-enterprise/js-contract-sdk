import {ContractState} from "../state";
import {AssetOperationsRegistry} from "../assets/asset-operations-registry";
import {Auth} from "./auth";

import {RPC} from "../../grpc";
import {IncomingTransactionResp} from "../types/core";

export class ExecutionContext {
    private nonce = 0;

    public state: ContractState;
    private auth: Auth

    constructor(
        public incomingTxResp: IncomingTransactionResp,
        public rpcConnection: RPC,
        public assetOperations: AssetOperationsRegistry = new AssetOperationsRegistry(),
    ) {
        this.state = new ContractState(this);

        this.auth = new Auth(incomingTxResp.authToken)
        this.rpcConnection.Contract.setAuth(this.auth.metadata());
    }


    public getNonce() {
        this.nonce = this.nonce + 1;

        return this.nonce
    }

    public get tx() {
        return this.incomingTxResp.tx;
    }

    public get txId(): string {
        return this.tx.id;
    }

    public get contractId(): string {
        return this.tx.contractId;
    }

    public get params(): Map<string, string> {
        const paramsMap = new Map();

        for (const p of this.tx.params) {
            paramsMap.set(p.key, p.value);
        }

        return paramsMap;
    }
}