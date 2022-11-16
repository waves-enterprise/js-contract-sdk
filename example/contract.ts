import { Action, AttachedPayments, Contract, ContractState, Param, Payments, State } from '../packages/contract-core/src'

@Contract()
export class TestContract {
  @State state: ContractState

  @Action({ onInit: true })
  init() {
    this.state.set('moveNum', 0)
    this.state.set('currentMover', 'x')
  }

  @Action
  move(
  @Param('player') player: string,
    @Param('cell') cell: number,
    @Payments attachedPayments: AttachedPayments,
  ) {


    this.state.set('moveNum', cell)
    this.state.set('currentMover', attachedPayments[0].amount.toString())
  }
}