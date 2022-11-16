import {ContractIssue} from '@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_issue'
import {ContractReissue} from '@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_reissue'
import {ContractBurn} from '@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_burn'
import {
  ContractTransferOut,
} from '@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_transfer_out'
import {ContractAssetOperation} from '@wavesenterprise/js-contract-grpc-client/contract_asset_operation'
import {getExecutionContext} from '../decorators/common'
import {ContractBalanceResponse} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'

export type TBalance = {
  assetId: string | undefined,
  amount: number,
  decimals: number,
}


export function mapContractBalance(t: ContractBalanceResponse): TBalance {
  return {
    assetId: t.assetId,
    amount: t.amount.toNumber(),
    decimals: t.decimals,
  }
}

export class Asset {
  static getRPCConnection() {
    return getExecutionContext().rpcConnection
  }

  static getExecutionContext() {
    return getExecutionContext()
  }

  constructor(
    private assetId?: string,
    private nonce?: number,
  ) {
  }

  static from(assetId: string) {
    return new Asset(assetId)
  }

  static system() {
    return new Asset()
  }

  static async new(nonce?: number) {
    const nonceAssetId = nonce || this.getExecutionContext().getNonce()

    const assetId = await this.calculateAssetId(nonceAssetId)

    return new Asset(assetId, nonceAssetId)
  }

  getId() {
    return this.assetId
  }

  getNonce() {
    return this.nonce
  }

  issue(name: string, description: string, qty: number, decimals: number, isreissuable) {
    const operation = ContractIssue.fromPartial({
      nonce: this.nonce,
      assetId: this.assetId,
      decimals,
      description,
      name,
      isReissuable: isreissuable,
      quantity: qty,
    })

    Asset.getExecutionContext()
      .assetOperations
      .addOperation(ContractAssetOperation.fromPartial({
        contractIssue: operation,
      }))
  }

  reissue(qty: number, isReissuable: boolean) {
    const operation = ContractReissue.fromPartial({
      assetId: this.assetId,
      isReissuable,
      quantity: qty,
    })

    Asset.getExecutionContext()
      .assetOperations
      .addOperation(ContractAssetOperation.fromPartial({
        contractReissue: operation,
      }))
  }

  burn(amount: number) {
    const operation = ContractBurn.fromPartial({
      amount,
      assetId: this.assetId,
    })

    Asset.getExecutionContext()
      .assetOperations
      .addOperation(ContractAssetOperation.fromPartial({
        contractBurn: operation,
      }))
  }

  transfer(recipient: string, amount: number) {
    const operation = ContractTransferOut.fromPartial({
      assetId: this.assetId,
      recipient,
      amount,
    })

    Asset.getExecutionContext()
      .assetOperations
      .addOperation(ContractAssetOperation.fromPartial({
        contractTransferOut: operation,
      }))
  }

  balanceOf(address: string): Promise<TBalance> {
    return Asset.balanceOf(address, this.assetId)
  }

  static async calculateAssetId(nonce: number): Promise<string> {
    const res = await Asset.getRPCConnection().Contract
      .calculateAssetId({
        nonce,
      })

    return res.value
  }

  static async contractBalancesOf(assetIds: string[]): Promise<TBalance[]> {
    const res = await Asset.getRPCConnection().Contract
      .getContractBalances({
        assetsIds: assetIds,
      })

    return res.assetsBalances.map(mapContractBalance)
  }

  static async contractBalanceOf(assetId?: string): Promise<TBalance> {
    const res = await Asset.getRPCConnection().Contract
      .getContractBalances({
        assetsIds: [assetId ?? ''],
      })

    return res.assetsBalances.map(mapContractBalance)[0]
  }

  static balanceOf(address: string, assetId?: string): Promise<TBalance> {
    return this.getRPCConnection().Address.getAssetBalance(address, assetId)
  }
}

