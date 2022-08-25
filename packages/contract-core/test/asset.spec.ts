import 'reflect-metadata';
import {ContractTransactionResponse} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractTransferIn} from "@wavesenterprise/js-contract-grpc-client/contract_transfer_in";
import {ContractProcessor} from "../src/core/processors/contract-processor";
import {RPC} from "../src/rpc";
import {Action, Asset, Context, ContractState, Payments, State} from "../src";
import {Param, ServiceContainer} from "../dist";

jest.spyOn(RPC.prototype, 'addClient')
    .mockImplementation(
        () => {
            // console.log('mocked function');
        }
    )


const tIn = ContractTransferIn.fromPartial({
    assetId: new Uint8Array(Buffer.from('WEST')),
    amount: 100000
})


class ExampleContract {
    // @ts-ignore
    @State state: ContractState;

    // @ts-ignore
    @Action testAction(
        // @ts-ignore
        @Param('some-key') param: string,
        payments: Payments
    ) {
        this.state.set('test', 'a');

        const payment = payments[0]

        new Asset(payment.assetId)
            .transfer('some-vault', payment.amount * 0.5);
    }
}

describe('Test asset Operations', () => {
    let mockTx
    let processor = new ContractProcessor(new RPC({} as any));

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
                    {
                        stringValue: 'testAction',
                        key: 'action'
                    },
                    {
                        stringValue: 'some-key-value',
                        key: 'some-key'
                    }
                ],
                fee: 0,
                version: 1,
                proofs: new Uint8Array(),
                timestamp: new Date().getTime(),
                feeAssetId: {
                    value: 'WAVES'
                },
                payments: [tIn],
            }
        })
    })

    it('should execute state update and transfer out of WEST', async function () {
        const ctx = new Context(mockTx);

        const entries = await processor.process(ctx, ExampleContract);

        expect(entries[0]).toBeDefined();
        expect(entries[0].key).toEqual('test');
        expect(entries[0].stringValue).toEqual('a');
        expect(ctx.assetOperations.operations[0]).toBeDefined();
    });
})