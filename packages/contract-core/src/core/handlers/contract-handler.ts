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
        private contractClass: Constructable<any>
    ) {
    }

    async handle(ctx: Context, state: ContractState): Promise<void> {
        if (!this.contractClass) {
            throw new Error('Contract handler class not provided');
        }
        try {
            await this.actionResolver.invoke(this.contractClass, ctx, state);

            this.log.info('Contract handler executed successfully');
        } catch (e) {
            this.log.error('Invoker error', e);
            throw new InvokeContractActionException(e.message);
        }
    }
}
