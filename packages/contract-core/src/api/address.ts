import { getExecutionContext } from './decorators/common'

export class Address {
  static getRPC() {
    return getExecutionContext().rpcConnection
  }

  constructor(private address: string) {}

  balanceOf(assetId: string | undefined) {
    return Address.getRPC().Address.getAssetBalance(this.address, assetId)
  }

  getData(params: { limit?: number, offset?: number } = {}) {
    return Address.getRPC().Address.getData(this.address, params)
  }
}