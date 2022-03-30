import 'reflect-metadata';

import {Action, Context, Contract, ContractState} from "../src";

@Contract()
export class TestContract {
    @Action({onInit: true})
    async init(state: ContractState, ctx: Context) {
        state.set('isInit', true);
        state.set('key-1', 'value-1');
    }

    @Action
    setValue(ctx: Context, state: ContractState) {
        state.set('key-1', ctx.params.get('changeKey'));
    }
}