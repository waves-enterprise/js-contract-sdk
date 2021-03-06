import {RPC} from "../../rpc";
import {Context} from "../context";
import {ContractTransactionResponse} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractProcessor} from "../processors/contract-processor";
import {ContractError} from "../exceptions";
import {envConfig} from "../../rpc/config";

export class WorkerHandler {
    private readonly processor: ContractProcessor;
    private readonly rpc: RPC;

    constructor(
        private messagePort: MessagePort,
        private contractClass: any
    ) {
        this.rpc = new RPC(envConfig());
        this.rpc.Contract.connect()

        this.processor = new ContractProcessor(this.rpc);
    }

    handle = async (resp: ContractTransactionResponse) => {
        const ctx = new Context(resp);

        this.rpc.Contract
            .setAuth(ctx.auth.metadata());

        try {
            const entries = await this.processor.process(ctx, this.contractClass);

            await this.rpc.Contract.commitExecutionSuccess({
                results: entries,
                txId: ctx.transaction.id
            })
        } catch (e) {
            await this.rpc.Contract.commitExecutionError({
                txId: ctx.transaction.id,
                code: e.code || 0,
                message: e.message || 'Unexpected error'
            })
        }finally {
            this.messagePort.postMessage('done');
        }
    }
}