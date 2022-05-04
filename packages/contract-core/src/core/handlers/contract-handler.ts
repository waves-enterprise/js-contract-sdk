import {Context} from "../context";
import {ContractRegistry} from "../contract-registry";
import {ActionResolver} from "../action-resolver";
import {ContractState} from "../state/contract-state";
import {logger} from "../logger";
import {InvokeContractActionException} from "../exceptions";

export class ContractHandler {
    log = logger(this)

    async handle(ctx: Context, state: ContractState): Promise<void> {
        const contract = ContractRegistry.getDefault();
        const actionResolver = new ActionResolver();

        if (!contract) {
            throw new Error('Contract handler class not provided');
        }

        try {
            await actionResolver.invoke(contract, ctx, state);

            this.log.info('Contract handler executed successfully');
        } catch (e) {
            console.log(e)
            throw new InvokeContractActionException(e.message);
        }
    }
}