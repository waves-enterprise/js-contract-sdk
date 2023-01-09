import {
  ContractTransactionResponse as ContractTransactionResponseRaw,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { ContractTransferIn } from '@wavesenterprise/js-contract-grpc-client/contract_transfer_in'
import { ContractTransactionResponse } from '@wavesenterprise/we-node-grpc-api'

export function mockAction(action: string) {
  return ContractTransactionResponseRaw.fromPartial({
    authToken: 'test-token',
    transaction: {
      id: 'some-tx-id',
      type: 104,
      sender: 'iam',
      senderPublicKey: 'mypc',
      contractId: 'test-contract',
      params: [
        {
          stringValue: action,
          key: 'action',
        },
      ],
      version: 5,
      payments: [
        ContractTransferIn.fromPartial({
          assetId: 'test',
          amount: 10000,
        }),
      ],
      proofs: new Uint8Array(),
      timestamp: new Date().getTime(),
    },
  }) as ContractTransactionResponse
}
