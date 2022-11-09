import { ContractTransactionResponse } from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { ContractTransferIn } from '@wavesenterprise/js-contract-grpc-client/contract_transfer_in'

export function mockRespTx(name: string) {
  return ContractTransactionResponse.fromPartial({
    authToken: 'test-token',
    transaction: {
      id: 'some-tx-id',
      type: 104,
      sender: 'iam',
      senderPublicKey: 'mypc',
      contractId: 'test-contract',
      params: [
        {
          stringValue: name,
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
  })
}
