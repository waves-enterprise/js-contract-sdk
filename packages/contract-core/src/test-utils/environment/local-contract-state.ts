import { TVal } from '../../intefaces/contract'
import Long from 'long'
import { ContractIssue } from '@wavesenterprise/we-node-grpc-api'
import { Account } from '../types'

const Native = ':native'

export type IBlockchainState = {
  setKey(key: string, value: TVal),

  getKeys(keys: string[]): TVal[],
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


export class LocalAssets {
  private assets: Map<string, ContractIssue>
  private balances: Map<string, Map<Account, Long>>

  constructor() {
    this.balances = new Map<string, Map<Account, Long>>()
    this.assets = new Map<string, ContractIssue>()

    this.addBalance(Native, '__root', Long.MAX_VALUE)
  }

  addBalance(assetId: string, address: string, amount: Long) {
    let balancesMap = this.balances.get(assetId)

    if (!balancesMap) {
      balancesMap = new Map<Account, Long>()
    }

    balancesMap.set(address, amount)

    this.balances.set(assetId, balancesMap)
  }


  getBalance(address: string, assetId = Native) {
    if (!this.balances.get(assetId)) {
      throw new Error('asset not exists')
    }

    const balances = this.balances.get(assetId)!

    return balances.get(address) || Long.fromNumber(0)
  }

  transfer(from: string, to: string, amount: Long, assetId = Native) {
    const senderBalance = this.getBalance(from, assetId)
    const recipientBalance = this.getBalance(to, assetId)

    if (!senderBalance.subtract(amount).gte(0)) {
      throw new Error('unsufficient balance')
    }

    const asset = this.balances.get(assetId)!

    asset.set(from, senderBalance.subtract(amount))
    asset.set(to, recipientBalance.add(amount))

    this.balances.set(assetId, asset)
  }

  canTransfer(address: string, value: Long) {
    return this.getBalance(address).gte(value)
  }

  issue(res: ContractIssue, _: string) {
    if (this.assets.get(res.assetId!)) {
      throw new Error('asset already issued')
    }

    this.assets.set(res.assetId!, res)
  }
}
