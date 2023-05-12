import {TVal} from "../../intefaces/contract";
import Long from "long";
import {ContractIssue} from "@wavesenterprise/we-node-grpc-api";
import {Account} from "../blockchain";

export interface IBlockchainState {
  setKey(key: string, value: TVal);

  getKeys(keys: string[]): TVal[]
}


export class LocalContractState implements IBlockchainState {
  private state = new Map<string, TVal>()

  setKey(key: string, value: TVal) {
    this.state.set(key, value)
  }

  getKeys(keys: string[]): TVal[] {
    return keys.map((key) => this.state.get(key) as TVal)
  }
}

const WEST = '__WEST__';

export class LocalAssets {
  private assets: Map<string, ContractIssue>;
  private balances: Map<string, Map<Account, Long>>;


  constructor() {
    this.balances = new Map<string, Map<Account, Long>>();

    const westBalances = new Map<Account, Long>()
    westBalances.set('__root', Long.MAX_VALUE)

    this.balances.set(WEST, westBalances)
  }

  getBalance(address: string, assetId = WEST) {
    if (this.balances.get(assetId)) {
      throw new Error('asset not exists')
    }

    const balances = this.balances.get(assetId)!

    return balances.get(address) || Long.fromNumber(0)
  }

  transfer(from: string, to: string, amount: Long, assetId = WEST) {
    const senderBalance = this.getBalance(from);
    const recipientBalance = this.getBalance(to);

    if (!senderBalance.subtract(amount).gte(0)) {
      throw new Error("unsufficient balance")
    }

    const asset = this.balances.get(assetId)!;

    asset.set(from, senderBalance.subtract(amount))
    asset.set(to, recipientBalance.add(amount))

    this.balances.set(assetId, asset)
  }

  canTransfer(address: string, value: Long) {
    return this.getBalance(address).gte(value)
  }

  issue(res: ContractIssue, owner: string) {
    if (this.assets.get(res.assetId!)) {
      throw new Error('asset already issued')
    }

    this.assets.set(res.assetId!, res)
  }
}