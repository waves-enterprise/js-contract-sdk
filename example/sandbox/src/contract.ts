import {
  Action,
  Contract,
  IncomingTx,
  logger,
  Mapping,
  Param,
  Params,
  TVar,
  Tx,
  Var,
} from '@wavesenterprise/contract-core'
import BN from 'bn.js'


@Contract()
export default class MyContract {

  log = logger(this)

  @Var() counter!: TVar<number>

  @Var() participants!: Mapping<number>

  @Action({ onInit: true })
  init(@Params() params: Record<string, unknown>) {
    this.counter.set(0)
    this.log.info('all params', params)
  }

  @Action
  async increment(@Tx tx: IncomingTx, @Param('by') by: BN, @Param('invisible') isInvisible: boolean) {
    const { senderPublicKey } = tx
    const counter = await this.counter.get()
    const participantValue = (await this.participants.tryGet(senderPublicKey)) ?? 0
    this.participants.set(senderPublicKey, by.toNumber() + participantValue)
    this.counter.set(counter + by.toNumber())
    this.log.info('is it invisible?', isInvisible)
  }
}
