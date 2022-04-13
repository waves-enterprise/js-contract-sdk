import {Context} from "../context";
import {ContractRegistry} from "../contract-registry";
import {ActionResolver} from "../action-resolver";
import {ContractState} from "../state/contract-state";
import {logger} from "../logger";

export class ContractHandler {
    log = logger(this)

    async handle(ctx: Context, state: ContractState): Promise<void> {
        const contract = ContractRegistry.getDefault();
        const actionResolver = new ActionResolver();

        await actionResolver.invoke(contract, ctx, state);
    }
}