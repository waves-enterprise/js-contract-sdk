import { ExecutionContext } from '../../execution'
import { Asset, AssetBurn, AssetConfig, AssetIssue, AssetReissue, AssetTransfer, Balance } from './asset'

export class AssetsService {

  private nonce = 1

  constructor(private readonly context: ExecutionContext) {
  }

  calculateAssetId() {
    return this.context.grpcClient.contractService.calculateAssetId({
      nonce: this.nonce,
    })
  }

  private makeAsset(config: AssetConfig) {
    return new Asset(
      config,
      this.context.assets,
      this.context.grpcClient.contractAddressService,
      this.context.grpcClient.contractService,
    )
  }

  getAsset(assetId: string) {
    return this.makeAsset({
      assetId,
    })
  }

  async issueAsset(config: AssetIssue) {
    const assetId = await this.calculateAssetId()
    const asset = this.makeAsset({ assetId, nonce: this.nonce })
    this.nonce++
    asset.issue(config)
    return asset
  }

  reissueAsset(assetId: string, config: AssetReissue) {
    return this.getAsset(assetId).reissue(config)
  }

  burnAsset(assetId: string, config: AssetBurn) {
    return this.getAsset(assetId).burn(config)
  }

  transferAsset(assetId: string, config: AssetTransfer) {
    return this.getAsset(assetId).transfer(config)
  }

  getAssetBalance(assetId: string, address?: string) {
    return this.getAsset(assetId).getBalanceOf(address)
  }

  getBatchAssetBalances(assetsIds: string[]): Promise<Balance[]> {
    return this.context.grpcClient.contractService.getContractBalances({
      assetsIds,
    })
  }

}
