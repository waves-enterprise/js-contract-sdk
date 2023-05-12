import {
  ContractTransactionResponse as ContractTransactionResponseRaw,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import {ContractTransferIn} from '@wavesenterprise/js-contract-grpc-client/contract_transfer_in'
import {ContractTransactionResponse} from '@wavesenterprise/we-node-grpc-api'

export function txFactory({action, params, payments, contractId}: {
  action: string,
  params?: object,
  payments?: { assetId?: string, amount: number }[],
  contractId: string
}) {
  return ContractTransactionResponseRaw.fromPartial({
    authToken: 'test-token',
    transaction: {
      id: 'some-tx-id',
      type: 104,
      sender: 'tester',
      senderPublicKey: 'mypc',
      contractId: contractId,
      params: [
        {
          stringValue: action,
          key: 'action',
        },
      ],
      version: 5,
      payments: payments?.map((p) => {
        return ContractTransferIn.fromPartial({
          assetId: p.assetId,
          amount: p.amount,
        })
      }),
      proofs: new Uint8Array(),
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
