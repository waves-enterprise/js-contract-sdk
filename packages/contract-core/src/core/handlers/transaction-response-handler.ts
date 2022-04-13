import {ContractTransactionResponse} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {Context} from "../context";
import {Index} from "../../rpc";
import {ContractProcessor} from "../processors/contract-processor";


export class TransactionResponseHandler {
    processor: ContractProcessor;

    constructor(
        private rpc: Index
    ) {
        this.processor = new ContractProcessor(rpc);
    }

    handle = (resp: ContractTransactionResponse) => {
        const ctx = new Context(resp);

        this.rpc.Contract.setAuth(ctx.auth.metadata());

        this.processor.process(ctx);
    }
}