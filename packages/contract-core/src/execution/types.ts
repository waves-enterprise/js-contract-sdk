import { TVal } from '../intefaces/contract'
import Long from 'long'

export type TParam = {
  key: string,
  value: TVal,
  type: string,
}

export type TransferIn = {
  assetId?: string,
  amount: Long,
}

export type AttachedPayments = TransferIn[]

export type IncomingTx = {
  id: string,
  type: number,
  sender: string,
  senderPublicKey: string,
  contractId: string,
  version: number,
  fee: Long,
  proofs: Uint8Array,
  timestamp: number,
  feeAssetId?: string,
  payments: TransferIn[],
  params: TParam[],
}

export type BlockInfo = {
  height: number,
  timestamp: number,
  minerAddress: string,
  reference: string,
}
