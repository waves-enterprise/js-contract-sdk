import { Action, Contract, IncomingTx, logger, Mapping, Param, TVar, Tx, Var } from '@wavesenterprise/contract-core'
import BN from 'bn.js'


@Contract()
export default class MyContract {

  log = logger(this)

  @Var() counter!: TVar<number>

  @Var() participants!: Mapping<number>

  @Action({ onInit: true })
  init() {
    this.counter.set(0)
  }

  @Action
  async increment(@Param('by') by: BN, @Tx tx: IncomingTx) {
    const { senderPublicKey } = tx
    const counter = await this.counter.get()
    const participantValue = (await this.participants.tryGet(senderPublicKey)) ?? 0
    this.participants.set(senderPublicKey, by.toNumber() + participantValue)
    this.counter.set(counter + by.toNumber())
  }
}
