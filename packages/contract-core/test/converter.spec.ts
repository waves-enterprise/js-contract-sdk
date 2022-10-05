import 'reflect-metadata';
import {ContractTransactionResponse} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {TransactionConverter} from "../src/core/converters/transaction";
import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";
import {ContractTransferIn} from "@wavesenterprise/js-contract-grpc-client/contract_transfer_in";
import {IncomingTx} from "../dist/core/types/core";

describe('TransactionConverter', () => {
    let mockTx: ContractTransactionResponse;
    const cnv = new TransactionConverter()

    beforeAll(() => {
        mockTx = ContractTransactionResponse.fromPartial({
            authToken: 'test-token',
            transaction: {
                id: 'some-tx-id',
                type: 104,
                sender: 'iam',
                senderPublicKey: 'mypc',
                contractId: 'test-contract',
                params: [
                    DataEntry.fromPartial({
                        intValue: 10000,
                        key: 'integer-key'
                    }),
                    DataEntry.fromPartial({
                        stringValue: "test",
                        key: 'string-key'
                    }),
                ],
                version: 5,
                proofs: new Uint8Array(),
                timestamp: new Date().getTime(),
                feeAssetId: {
                    value: 'WAVES'
                },
                payments: [
                    ContractTransferIn.fromPartial({
                        amount: 1000000
                    }),
                    ContractTransferIn.fromPartial({
                        amount: 1000000,
                        assetId: ['assetId']
                    })
                ],
            }
        })
    })

    describe('parce incoming tx', () => {
        let tx: IncomingTx

        beforeAll(() => {
            tx = cnv.parse(mockTx.transaction!)
        })

        it('should parse transaction response to incoming', async function () {
            expect(tx.id).toEqual('some-tx-id')

            expect(tx.payments[0].amount.toNumber()).toEqual(1000000)
            expect(tx.payments[1].amount.toNumber()).toEqual(1000000)
        });
    })
})