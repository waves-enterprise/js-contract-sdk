import {RPC} from "../../rpc";
import {Context} from "../context";
import {ContractTransactionResponse} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractProcessor} from "../processors/contract-processor";
import {envConfig} from "../../rpc/config";
import {ServiceContainer} from "../service-container";
import {logger} from "../logger";

export class WorkerHandler {
    log = logger(this)

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

        ServiceContainer.set(this.rpc)
        this.rpc.Contract
            .setAuth(ctx.auth.metadata());

        try {
            const entries = await this.processor.process(ctx, this.contractClass);

            this.log.info(JSON.stringify({
                entries,
                operations: ctx.assetOperations.operations,
                tx: ctx.tx.id
            }, null, 2))

            const resp = await this.rpc.Contract.commitExecutionSuccess({
                results: entries,
                txId: ctx.tx.id,
                assetOperations: ctx.assetOperations.operations
            });

            this.log.info('Commit success', {
                results: entries,
                txId: ctx.tx.id,
                assetOperations: ctx.assetOperations.operations
            })
        } catch (e) {
            this.log.error(e.message || 'Unexpected error')

            await this.rpc.Contract.commitExecutionError({
                txId: ctx.tx.id,
                code: e.code || 0,
                message: e.message || 'Unexpected error'
            })
        } finally {
            this.messagePort.postMessage('done');
        }
    }
}