# @wavesenterpise/contract-core

Implements JS Contract SDK core functionality, rpc services, tools and utilities.

### Getting Started

Run following in command line:

```bash 
npm i @wavesenterpise/contract-core
```

Create `contract.ts` as follows

```ts 
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
  Block,
  Sender,
  BlockInfo,
} from '@wavesenterprise/contract-core'
import Long from 'long'

@Contract()
export default class #{contractName} {

  log = logger(this)

  @Var()
  counter!: ContractValue<number>

  @JsonVar()
  participants!: ContractMapping<UserData>

  @Action({ onInit: true })
  init(@Params() params: Record<string, unknown>) {
    this.counter.set(0)
    this.log.info('all params', params)
  }

  @Action({ preload: ['counter'] })
  async increment(@Tx() tx: IncomingTx, @Param('by') by: Long) {
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
  
  async saveInfo(@Sender() sender: string, @Block() currentBlock: BlockInfo) {
    // 
  }
}
```

To initialize contract use:
```ts
import { initContract } from '@wavesenterprise/contract-core'

initContract({
  contractPath: __dirname + '/contract.js', // path to compiled contract
  concurrencyLevel: 1,
})
```

## License

This project is licensed under the [MIT License](LICENSE).

