import {
    ContractTransaction,
    ContractTransactionResponse,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service';
import { Metadata } from '@grpc/grpc-js';
import { TxId } from './consts';
import { ParamsMap, ParamsMapper } from './mappers/params-mapper';
import {AssetOperationsRegistry} from "./assets/asset-operations-registry";

export class Auth {
    constructor(private _authToken: string) {}

    public authToken() {
        return this._authToken;
    }

    public metadata(): Metadata {
        const metadata = new Metadata();

        metadata.set('authorization', this._authToken);

        return metadata;
    }
}

export class Context {
    /**
     * Auth metadata
     *
     */
    public auth: Auth;

    /**
     * Transaction response from rpc
     *
     */
    public tx: ContractTransaction;

    /**
     * Mapped transaction params
     *
     */
    public paramsMap: ParamsMap;

    constructor(
        transactionResponse: ContractTransactionResponse,
        public assetOperations = new AssetOperationsRegistry()
    ) {
        this.auth = new Auth(transactionResponse.authToken);

        if (!transactionResponse.transaction) {
            throw new Error('Transaction not provided');
        }

        this.tx = transactionResponse.transaction;
        this.paramsMap = new ParamsMapper().parse(transactionResponse.transaction);
    }

    public get contractId(): string {
        return this.tx.contractId;
    }

    public get isInit() {
        return this.tx.type === TxId.create;
    }

    public get params() {
        return this.paramsMap;
    }
}
