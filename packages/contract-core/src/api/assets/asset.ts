import { AssetsStorage } from './assets-storage'
import {
  ContractAddressService,
  ContractBurn,
  ContractIssue,
  ContractReissue,
  ContractService,
  ContractTransferOut,
} from '@wavesenterprise/we-node-grpc-api'
import { Base58 } from '../../utils/base58'
import Long from 'long'

export type Balance = {
  assetId: string,
  amount: Long,
  decimals: number,
}

export type AssetConfig = {
  assetId: string | undefined,
  nonce?: number,
}

export type AssetIssue = Omit<ContractIssue, 'assetId' | 'nonce'>

export type AssetReissue = Omit<ContractReissue, 'assetId'>

export type AssetBurn = Omit<ContractBurn, 'assetId'>

export type AssetTransfer = Omit<ContractTransferOut, 'assetId'>

export class Asset {
  constructor(
    private readonly config: AssetConfig,
    private readonly storage: AssetsStorage,
    private readonly addressService: ContractAddressService,
    private readonly contractService: ContractService,
  ) {
  }

  async getBalanceOf(address?: string): Promise<Balance> {
    if (address) {
      const balance = await this.addressService.getAssetBalance({
        assetId: Base58.decode(this.config.assetId),
        address: Base58.decode(address),
      })
      return {
        ...balance,
        assetId: Base58.encode(balance.assetId),
      }
    } else {
      const [balance] = await this.contractService.getContractBalances({
        assetsIds: [this.config.assetId ?? ''],
      })
      return balance
    }
  }

  getId() {
    return this.config.assetId
  }

  issue(config: AssetIssue) {
    this.storage.addIssue({
      ...config,
      assetId: this.config.assetId,
      nonce: this.config.nonce!,
    })
  }

  reissue(config: AssetReissue) {
    this.storage.addReissue({
      ...config,
      assetId: this.config.assetId,
    })
  }

  burn(config: AssetBurn) {
    this.storage.addBurn({
      ...config,
      assetId: this.config.assetId,
    })
  }

  transfer(config: AssetTransfer) {
    this.storage.addTransfer({
      ...config,
      assetId: this.config.assetId,
    })
  }


}
