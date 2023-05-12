import {
  Action,
  Assets,
  AssetsService,
  Contract,
  ContractMapping,
  ContractValue,
  IncomingTx,
  JsonVar,
  logger,
  Param,
  Params,
  preload,
  Tx,
  Var,
} from '@wavesenterprise/contract-core'
import Long from 'long'

type UserData = {
  publicKey: string,
  address: string,
  amount: number,
}

@Contract()
export default class MyContract {

  log = logger(this)

  @Var({ key: 'COUNTER' })
  counter!: ContractValue<number>

  @JsonVar({ key: 'PARTICIPANTS' })
  participants!: ContractMapping<UserData>

  @JsonVar({ key: 'ARR' })
  arr!: ContractValue<number[]>

  @Var({ key: 'NICE_ASSET_ID' })
  niceAssetId!: ContractValue<string>

  @Assets()
  assets!: AssetsService

  @Action({ onInit: true })
  async init(@Params() params: Record<string, unknown>) {
    this.counter.set(0)
    this.arr.set([Math.trunc(Math.random() * 10)])
    this.log.info('all params', params)
    const asset = await this.assets.issueAsset({
      name: 'NICE',
      description: 'nice asset',
      quantity: Long.fromNumber(100_000_000_000),
      decimals: 6,
      isReissuable: true,
    })
    this.niceAssetId.set(asset.getId()!)
  }

  @Action()
  async increment(@Tx() tx: IncomingTx, @Param('by') by: Long) {
    const { senderPublicKey, sender } = tx
    await preload(this, ['counter', ['participants', senderPublicKey], 'niceAssetId'])
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
    this.assets.transferAsset(await this.niceAssetId.get(), {
      recipient: sender,
      amount: Long.fromNumber(10),
    })
    this.log.info(`Transfer to ${sender}`)
  }


  @Action()
  async leaseUnlease() {
    this.assets.
  }
}
