import { ExecutionContext } from '../../execution'
import {
  Asset,
  AssetBurn,
  AssetConfig,
  AssetIssue,
  AssetReissue,
  AssetTransfer,
  Balance,
  CancelLease,
  Lease,
} from './asset'
import { ContractCancelLease } from '@wavesenterprise/we-node-grpc-api'

export class AssetsService {
  private leaseNonce = 1
  private issueNonce = 1

  constructor(private readonly context: ExecutionContext) {
  }

  calculateAssetId() {
    return this.context.grpcClient.contractService.calculateAssetId({
      nonce: this.issueNonce,
    })
  }

  async calculateLeaseId(): Promise<{ leaseId: string, nonce: number }> {
    const leaseId = await this.context.grpcClient.contractService.calculateAssetId({
      nonce: this.leaseNonce,
    })

    const nonce = this.leaseNonce
    this.leaseNonce++

    return { leaseId, nonce }
  }

  private makeAsset(config: AssetConfig) {
    return new Asset(
      config,
      this.context.assets,
      this.context.grpcClient.contractAddressService,
      this.context.grpcClient.contractService,
    )
  }

  getAsset(assetId?: string | undefined) {
    return this.makeAsset({
      assetId,
    })
  }

  async issueAsset(config: AssetIssue) {
    const assetId = await this.calculateAssetId()
    const asset = this.makeAsset({ assetId, nonce: this.issueNonce })
    this.issueNonce++
    asset.issue(config)
    return asset
  }

  reissueAsset(assetId: string | undefined, config: AssetReissue) {
    return this.getAsset(assetId).reissue(config)
  }

  burnAsset(assetId: string | undefined, config: AssetBurn) {
    return this.getAsset(assetId).burn(config)
  }

  transferAsset(assetId: string | undefined, config: AssetTransfer) {
    return this.getAsset(assetId).transfer(config)
  }

  getAssetBalance(assetId: string | undefined, address?: string) {
    return this.getAsset(assetId).getBalanceOf(address)
  }

  getBatchAssetBalances(assetsIds: string[]): Promise<Balance[]> {
    return this.context.grpcClient.contractService.getContractBalances({
      assetsIds,
    })
  }

  async lease(lease: Lease): Promise<string> {
    const { leaseId, nonce } = await this.calculateLeaseId()

    this.context.assets.addLease({ leaseId, nonce, ...lease })

    return leaseId
  }

  leaseCancel(lease: CancelLease) {
    return this.context.assets.addCancelLease(lease)
  }
}
