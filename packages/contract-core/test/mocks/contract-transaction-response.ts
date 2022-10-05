import { ContractTransactionResponse } from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service';

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
            version: 4,
            proofs: new Uint8Array(),
            timestamp: new Date().getTime(),
        },
    });
}
