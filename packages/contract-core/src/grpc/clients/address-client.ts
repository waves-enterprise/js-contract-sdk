import { credentials, ServiceError } from '@grpc/grpc-js'
import {
  AddressDataRequest,
  AddressServiceClient,
  AssetBalanceRequest,
  AssetBalanceResponse,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_address_service'
import { TBalance } from '../../api/assets/asset'
import { Base58 } from '../../utils/base58'
import { ContractError } from '../../execution'
import { logger } from '../../api'
import { AddressDataResponse } from '@wavesenterprise/js-contract-grpc-client/address/address_public_service'
import { DataEntry } from '@wavesenterprise/js-contract-grpc-client/data_entry'
import { RPCClient } from '../types'


export class AddressClient {
  logger = logger(this)

  impl: AddressServiceClient

  constructor(
    private rpc: RPCClient,
  ) {
    this.impl = new AddressServiceClient(
      this.rpc.getConfig().address,
      credentials.createInsecure(),
    )
  }

  getAssetBalance(address: string, assetId: string | undefined): Promise<TBalance> {
    return new Promise((resolve, reject) => {
      this.impl.getAssetBalance(
        AssetBalanceRequest.fromPartial({
          address: Base58.decode(address),
          assetId: typeof assetId === 'string' ? Base58.decode(assetId) : assetId,
        }),
        this.rpc.getAuth(),
        (error: ServiceError, response: AssetBalanceResponse) => {
          if (error) {
            const { metadata } = error
            // @ts-ignore
            const { internalRepr } = metadata
            const internalReprKeysAndValues = [] as string[]
            for (const [key, value] of internalRepr.entries()) {
              internalReprKeysAndValues.push(`${key}: ${value}`)
            }
            reject(new ContractError(`GRPC Node error. AddressService.GetAssetBalance: ${internalReprKeysAndValues.join(', ')}`))
            return
          }

          resolve({
            assetId: response.assetId ? Base58.encode(response.assetId) : response.assetId,
            amount: response.amount.toNumber(),
            decimals: response.decimals,
          } as TBalance)
        },
      )
    })
  }

  getData(address: string, { limit, offset }: { limit?: number, offset?: number } = {}): Promise<DataEntry[]> {
    return new Promise((resolve, reject) => {
      this.impl.getAddressData(
        AddressDataRequest.fromPartial({ address, limit, offset }),
        this.rpc.getAuth(),
        (error: ServiceError, response: AddressDataResponse) => {
          if (error) {
            const { metadata } = error
            // @ts-ignore
            const { internalRepr } = metadata
            const internalReprKeysAndValues = [] as string[]
            for (const [key, value] of internalRepr.entries()) {
              internalReprKeysAndValues.push(`${key}: ${value}`)
            }
            reject(new ContractError(`GRPC Node error. AddressService.GetAddressData: ${internalReprKeysAndValues.join(', ')}`))
            return
          }

          resolve(response.entries)
        },
      )
    })
  }
}