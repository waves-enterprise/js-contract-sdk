import { Contract, ContractState, Ctx, State,ExecutionContext } from '../packages/contract-core/src'

@Contract()
export class TestContract {
    @State state: ContractState
    @Ctx context: ExecutionContext
}