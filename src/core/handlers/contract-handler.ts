import {Context} from "../context";
import {ContractRegistry} from "../contract-registry";
import {ActionResolver} from "../action-resolver";
import {ExecutionResult} from "../../intefaces/contract";
import {ContractState} from "../state/contract-state";

export interface IHandler {
    handle(ctx: Context, state: ContractState): ExecutionResult
}

export class ContractHandler implements IHandler {
    handle(ctx: Context, state: ContractState): ExecutionResult {
        const contract = ContractRegistry.getDefault();

        const actionResolver = new ActionResolver();

        try {
            actionResolver.invoke(contract, ctx, state);

            return {
                entries: state.getStateEntries(),
                status: 'success'
            }
        } catch (e) {
            console.log('[Invoke error] e=', e)

            return {
                entries: [],
                status: 'error'
            }
        }
    }
}