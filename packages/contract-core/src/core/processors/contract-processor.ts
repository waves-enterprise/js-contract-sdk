import {Context} from "../context";
import {ServiceContainer} from "../service-container";
import {ContractHandler} from "../handlers/contract-handler";
import {ParamsMapper} from "../mappers/params-mapper";
import {ContractState} from "../state/contract-state";
import {logger} from "../logger";
import {RPC} from "../../rpc";

export class ContractProcessor {
    log = logger(this);

    private paramsProcessor: ParamsMapper;

    constructor(
        private rpc: RPC
    ) {
        this.paramsProcessor = new ParamsMapper();
    }

    async process(ctx: Context) {
        const contract = this.rpc.Contract;

        const state = new ContractState(this.rpc, ctx);
        const contractHandler = new ContractHandler();

        ServiceContainer.set(ctx);
        ServiceContainer.set(state);

        try {
            await contractHandler.handle(ctx, state);
            this.log.info('Handled', state.getStateEntries());

            await contract.commitExecutionSuccess({
                txId: ctx.transaction.id,
                results: state.getStateEntries()
            })

            this.log.info('Contract state committed successfully', JSON.stringify(state.getStateEntries()))
        } catch (e) {
            await contract.commitExecutionError({
                txId: ctx.transaction.id,
                code: e.number || 0,
                message: e.message
            })
        }
    }
}
