import 'reflect-metadata'

import {Blockchain} from "../blockchain";
import {Action, Assets, AssetsService, ContractState, Ctx, State} from "../../api";
import {Test} from "./test-wrapper";
import {OpenedContract} from "../contract-wrapper";
import {ExecutionContext} from "../../execution";
import Long from "long";

class TestContract {
  @State state: ContractState
  @Assets() assets: AssetsService;

  @Action
  async test() {
    this.state.set('str', 'str1')
    this.state.set('int', 100)
    this.state.set('bool', false)
    this.state.set('bin', new Uint8Array([0, 1, 2]))

    const west = this.assets.getAsset()
    const waves = this.assets.getAsset('waves')
    west.transfer({
      amount: Long.fromNumber(100),
      recipient: 'receiver'
    })

    const asset = await this.assets.issueAsset({
      decimals: 8,
      description: "WAVES",
      isReissuable: false,
      name: "WAVES",
      quantity: Long.fromNumber(1000 * 10e7),
    })
  }

  @Action
  async onlyGet(
    @Ctx() ctx: ExecutionContext
  ) {
    const {int, str, bool} = await this.state.getBatch(['str', 'int', 'bool'])

    this.state.set('str', str + ":" + str)
    this.state.set('int', (int as number) + 1)
    this.state.set('bool', !bool)
  }
}


describe('Test', () => {
  let blockchain: Blockchain;
  let contract: OpenedContract<Test>

  beforeAll(() => {
    blockchain = new Blockchain();

    const contractId = blockchain.deployContract(TestContract);
    contract = blockchain.connect(Test.createFromAddress(contractId, TestContract));

    blockchain.fundAccount('tester', 1000);
  })

  it('should apply tx to state', async function () {
    await contract.invokeTest()

    expect(contract.getKey('str')).toEqual('str1')
    expect(contract.getKey('int')).toEqual(100)
    expect(contract.getKey('bool')).toEqual(false)

    expect(blockchain.getBalance('receiver').toNumber()).toEqual(100)
    expect(blockchain.getBalance(TestContract.name).toNumber()).toEqual(900)
  });
})