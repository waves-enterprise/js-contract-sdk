import {Context} from '../context';
import {ServiceContainer} from '../service-container';
import {ContractHandler} from '../handlers/contract-handler';
import {ContractState} from '../state';
import {logger} from '../logger';
import {RPC} from '../../rpc';
import {Payments} from "../decorators/payments";

export class ContractProcessor {
    log = logger(this);

    constructor(private rpc: RPC) {
    }

    async process(ctx: Context, contractClass: any) {
        const state = new ContractState(this.rpc, ctx);
        const contractHandler = new ContractHandler(contractClass);

        ServiceContainer.set(Payments.parseTx(ctx.tx.payments))
        ServiceContainer.set(ctx);
        ServiceContainer.set(state);

        await contractHandler.handle(ctx, state);

        return state.getStateEntries();
    }
}
