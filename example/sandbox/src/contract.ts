import { Action, Contract, logger, Param, TVar, Var } from '@wavesenterprise/contract-core'
import BN from 'bn.js'


@Contract()
export default class MyContract {

  log = logger(this)

  @Var() counter!: TVar<number>

  @Action({ onInit: true })
  init() {
    this.counter.set(0)
  }

  @Action
  async increment(@Param('by') by: BN) {
    const counter = await this.counter.get()
    this.counter.set(counter + by.toNumber())
  }
}
