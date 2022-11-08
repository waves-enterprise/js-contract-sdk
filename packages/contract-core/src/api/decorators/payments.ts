import { ContractTransferIn } from '@wavesenterprise/js-contract-grpc-client/contract_transfer_in'
import Long from 'long'

export class Payments extends Array<{ assetId?: string, amount: Long }> {
  static parseTx(transfersIn: ContractTransferIn[]) {
    return Payments.from(transfersIn)
  }
}
