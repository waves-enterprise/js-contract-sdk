import {
  ContractTransactionResponse as ContractTransactionResponseRaw,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { ContractTransferIn } from '@wavesenterprise/js-contract-grpc-client/contract_transfer_in'
import { ContractTransactionResponse, DataEntry } from '@wavesenterprise/we-node-grpc-api'

import { DataEntry as DE } from '@wavesenterprise/js-contract-grpc-client/data_entry'

import { Keypair } from '@wavesenterprise/signer'
import { randomUint8Array, toBase58 } from '@wavesenterprise/crypto-utils'

export async function txFactory({ action, sender, params = [], payments, contractId }: {
  action: string,
  params?: DataEntry[],
  payments?: Array<{ assetId?: string, amount: number }>,
  contractId: string,
  sender: Keypair,
}) {
  return ContractTransactionResponseRaw.fromPartial({
    authToken: toBase58(randomUint8Array(32)),
    transaction: {
      id: toBase58(randomUint8Array(32)),
      type: 104,
      sender: await sender.address(),
      senderPublicKey: await sender.publicKey(),
      contractId,
      params: [
        {
          stringValue: action,
          key: 'action',
        },


        ...(params.map(DE.fromPartial)),
      ],
      version: 5,
      payments: payments?.map((p) => {
        return ContractTransferIn.fromPartial({
          assetId: p.assetId,
          amount: p.amount,
        })
      }),
      proofs: randomUint8Array(32),
      timestamp: new Date().getTime(),
    },
    currentBlockInfo: {
      height: 1,
      timestamp: Date.now(),
      minerAddress: '',
      reference: '',
    },
  }) as ContractTransactionResponse
}
