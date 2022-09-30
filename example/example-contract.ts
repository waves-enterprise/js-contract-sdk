import {Action, assert, Context, Contract, ContractState, Ctx, Param, State} from "../packages/contract-core/src";

@Contract()
export class TestContract {
    @State state: ContractState;
    @Ctx context: Context;

    // @Var({ mutable: false, name: 'test', eager: true }) admin: TVar<string>;
    // @Var() count: TVar<number>;
    // @Var() isInited: TVar<boolean>;
    // @Var() bin: TVar<Buffer>;


    @Action({onInit: true})
    async init() {

        this.admin.set('myAdmin')
    }

    @Action
    async anotherAction() {
        this.admin.set('myAdmin') // throws error
    }
}