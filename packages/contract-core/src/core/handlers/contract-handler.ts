import {Context} from '../context';
import {ActionResolver} from '../action-resolver';
import {ContractState} from '../state';
import {logger} from '../logger';
import {InvokeContractActionException} from '../exceptions';
import {Constructable} from "../../intefaces/helpers";

export class ContractHandler {
    log = logger(this);

    private actionResolver: ActionResolver;

    constructor(
        private contract: Constructable<any>
    ) {
        this.actionResolver = new ActionResolver();
    }

    async handle(ctx: Context, state: ContractState): Promise<void> {
        if (!this.contract) {
            throw new Error('Contract handler class not provided');
        }
        try {
            await this.actionResolver.invoke(this.contract, ctx, state);

            this.log.info('Contract handler executed successfully');
        } catch (e) {
            this.log.error('Invoker error', e);

            throw new InvokeContractActionException(e.message);
        }
    }
}
