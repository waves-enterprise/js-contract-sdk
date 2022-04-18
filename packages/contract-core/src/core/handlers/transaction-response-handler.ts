import {ContractTransactionResponse} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {Context} from "../context";
import {RPC} from "../../rpc";
import {ContractProcessor} from "../processors/contract-processor";
import {logger} from "../logger";


export class TransactionResponseHandler {
    log = logger(this)

    processor: ContractProcessor;

    constructor(
        private rpc: RPC
    ) {
        this.processor = new ContractProcessor(rpc);
    }

    handle = (resp: ContractTransactionResponse) => {
        const ctx = new Context(resp);

        this.log.info('ContractId=', resp.transaction.contractId);

        this.rpc.Contract.setAuth(ctx.auth.metadata());

        this.log.info('Contract Transaction response received', JSON.stringify(resp.transaction));

        this.processor.process(ctx)
            .then(() => {
                this.log.info('Contract Transaction proceed');
            })
            .catch(e => {
                this.log.error('Contract Transaction error', e);
            })
    }
}