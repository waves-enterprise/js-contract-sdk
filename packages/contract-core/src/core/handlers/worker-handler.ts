import {RPC} from "../../rpc";
import {Context} from "../context";
import {ContractTransactionResponse} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractProcessor} from "../processors/contract-processor";
import {envConfig} from "../../rpc/config";
import {ServiceContainer} from "../service-container";
import {logger} from "../logger";
import Long from "long";
import {ContractTransferIn} from "@wavesenterprise/js-contract-grpc-client/contract_transfer_in";

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


    _parsedPayments(payments: any[]) {
        return payments.map(t => ({...t, amount: Long.fromValue(t.amount)}))
    }


    handle = async (resp: ContractTransactionResponse) => {
        if (resp.transaction) {
            resp.transaction.payments = this._parsedPayments(resp.transaction?.payments || [])
        }

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
            this.log.info('Execution error', e)
            this.log.error(e.message || 'Unexpected error')

            const resp = await this.rpc.Contract.commitExecutionError({
                txId: ctx.tx.id,
                code: e.code || 0,
                message: e.message || 'Unexpected error'
            })

            this.log.error("execution error commit response ", resp)
        } finally {
            this.messagePort.postMessage('done');
        }
    }
}