import {ContractTransaction, ContractTransactionResponse} from "@waves-enterprise/js-contract-grpc-client/contract/contract_contract_service";
import {Metadata} from "@grpc/grpc-js";
import {TxId} from "./consts";
import {ParamsMap, ParamsMapper} from "./mappers/params-mapper";

export class Auth {
    constructor(private _authToken: string) {
    }

    public authToken() {
        return this._authToken;
    }

    public metadata(): Metadata {
        const metadata = new Metadata()

        metadata.set('authorization', this._authToken)

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
    public transaction: ContractTransaction;

    /**
     * Mapped transaction params
     *
     */
    public paramsMap: ParamsMap;

    constructor(transactionResponse: ContractTransactionResponse) {
        this.auth = new Auth(transactionResponse.authToken);
        this.transaction = transactionResponse.transaction;
        this.paramsMap = new ParamsMapper()
            .parse(transactionResponse.transaction)
    }

    public get contractId(): string {
        return this.transaction.contractId;
    }

    public get isInit() {
        return this.transaction.type === TxId.create;
    }

    public get params() {
        return this.paramsMap;
    }
}