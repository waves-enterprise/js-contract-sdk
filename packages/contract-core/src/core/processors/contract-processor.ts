import { Context } from '../context';
import { ServiceContainer } from '../service-container';
import { ContractHandler } from '../handlers/contract-handler';
import { ContractState } from '../state';
import { logger } from '../logger';
import { RPC } from '../../rpc';

export class ContractProcessor {
    log = logger(this);

    constructor(private rpc: RPC) {}

    async process(ctx: Context, contractClass: any) {
        const state = new ContractState(this.rpc, ctx);
        const contractHandler = new ContractHandler(contractClass);

        ServiceContainer.set(ctx);
        ServiceContainer.set(state);

        this.log.info('Process incoming tx', ctx)
        await contractHandler.handle(ctx, state);

        return state.getStateEntries();
    }
}
