import { ContractTransferIn } from '@wavesenterprise/js-contract-grpc-client/contract_transfer_in'
import { TInt } from '../data-types/integer'
import { TransferIn } from '../types/core'

export class TransferInConverter {
    static parse = (transferIn: ContractTransferIn): TransferIn => {
      return {
        assetId: transferIn.assetId[0],
        amount: TInt.fromLong(transferIn.amount),
      }
    }
}