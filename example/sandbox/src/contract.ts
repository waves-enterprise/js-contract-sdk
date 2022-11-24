import {
  Action,
  Contract,
  ContractMapping,
  ContractValue,
  IncomingTx,
  JsonVar,
  logger,
  Param,
  Params,
  Tx,
  Var,
} from '@wavesenterprise/contract-core'
import BN from 'bn.js'

type UserData = {
  publicKey: string,
  address: string,
  amount: number,
}

@Contract()
export default class MyContract {

  log = logger(this)

  @Var()
  counter!: ContractValue<number>

  @JsonVar()
  participants!: ContractMapping<UserData>

  @JsonVar()
  arr!: ContractValue<number[]>

  @Action({ onInit: true })
  init(@Params() params: Record<string, unknown>) {
    this.counter.set(0)
    this.arr.set([Math.trunc(Math.random() * 10)])
    this.log.info('all params', params)
  }

  @Action({ preload: ['counter'] })
  async increment(@Tx tx: IncomingTx, @Param('by') by: BN) {
    const { senderPublicKey, sender } = tx
    const counter = await this.counter.get()
    let participant = await this.participants.tryGet(senderPublicKey)
    if (!participant) {
      participant = {
        publicKey: senderPublicKey,
        address: sender,
        amount: 0,
      }
    }
    participant.amount += by.toNumber()
    this.counter.set(counter + by.toNumber())
    this.participants.set(senderPublicKey, participant)
  }
}
