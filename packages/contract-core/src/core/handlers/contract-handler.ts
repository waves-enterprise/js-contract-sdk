import {Context} from "../context";
import {ContractRegistry} from "../contract-registry";
import {ActionResolver} from "../action-resolver";
import {ExecutionResult, ResultStatus} from "../../intefaces/contract";
import {ContractState} from "../state/contract-state";
import {logger} from "../logger";


export interface IHandler {
    handle(ctx: Context, state: ContractState): Promise<ExecutionResult>;
}

export class ContractHandler implements IHandler {
    log = logger(this)

    async handle(ctx: Context, state: ContractState): Promise<ExecutionResult> {
        const contract = ContractRegistry.getDefault();
        const actionResolver = new ActionResolver();

        try {
            await actionResolver.invoke(contract, ctx, state);

            this.log.info('Contract action executed successfully');

            return {
                entries: state.getStateEntries(),
                status: 'success' as ResultStatus
            }
        } catch (e) {
            this.log.error('Contract action executed with error', e);

            return {
                entries: [],
                status: 'error' as ResultStatus
            }
        }
    }
}