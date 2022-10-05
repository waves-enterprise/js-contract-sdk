import {Action, ContractState, ExecutionContext, State} from "../src";
import {ContractActionArgumentsExtractor} from "../src/core/execution/extractors/arguments-extractor";
import {RPC} from "../src/grpc";
import {TransactionConverter} from "../src/core/converters/transaction";
import {mockRespTx} from "./mocks/contract-transaction-response";
import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";
import {ContractTransaction} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractProcessor} from "../src/core/execution/contract-processor";

jest.spyOn(RPC.prototype, 'Contract', 'get')
    .mockReturnValue({
        setAuth() {
        },
        commitExecutionSuccess: jest.fn((args) => {
            // console.log(args)
        }),
        commitExecutionError: jest.fn((args) => {
            // console.log(args)
        }),
    } as any)

jest.spyOn(RPC.prototype, 'addClient')
    .mockImplementation(() => {
    })

describe('ParamsExtractor', () => {
    let rpc = new RPC({} as unknown as any)
    let extractor: ContractActionArgumentsExtractor;
    let txCnv: TransactionConverter;

    function mockExecutionContext(tx: ContractTransaction) {
        return new ExecutionContext({
            authToken: '',
            tx: txCnv.parse(tx)
        }, rpc)
    }


    beforeEach(() => {
        extractor = new ContractActionArgumentsExtractor();
        txCnv = new TransactionConverter();
    })

    it('should apply string value', async () => {
        class TestContract {
            @State state: ContractState

            @Action
            test() {
                this.state.setString('strictString', 'str')
                this.state.set('castString', 'str1')
            }
        }

        const tx = mockRespTx('test').transaction!;
        const ec = mockExecutionContext(tx)

        const processor = new ContractProcessor(
            TestContract,
            ec.rpcConnection,
        );

        await processor.handleIncomingTx(ec.incomingTxResp)

        expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
            {
                txId: 'some-tx-id',
                results: [
                    DataEntry.fromPartial({
                        stringValue: 'str',
                        key: 'strictString'
                    }),
                    DataEntry.fromPartial({
                        stringValue: 'str1',
                        key: 'castString'
                    })
                ],
                assetOperations: []
            }
        )
    })

    it('should apply int value', async () => {
        class TestContract {
            @State state: ContractState

            @Action
            test() {
                this.state.setInt('strictInt', 100)
                this.state.set('castInt', 1001)
            }
        }

        const tx = mockRespTx('test').transaction!;
        const ec = mockExecutionContext(tx)

        const processor = new ContractProcessor(
            TestContract,
            ec.rpcConnection,
        );

        await processor.handleIncomingTx(ec.incomingTxResp)

        expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
            {
                txId: 'some-tx-id',
                results: [
                    DataEntry.fromPartial({
                        intValue: 100,
                        key: 'strictInt'
                    }),

                    DataEntry.fromPartial({
                        intValue: 1001,
                        key: 'castInt'
                    })
                ],
                assetOperations: []
            }
        )
    })

    it('should apply boolean value', async () => {
        class TestContract {
            @State state: ContractState

            @Action
            test() {
                this.state.setBool('strictBool', false)
                this.state.set('castBool', true)
            }
        }

        const tx = mockRespTx('test').transaction!;
        const ec = mockExecutionContext(tx)

        const processor = new ContractProcessor(
            TestContract,
            ec.rpcConnection,
        );

        await processor.handleIncomingTx(ec.incomingTxResp)

        expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
            {
                txId: 'some-tx-id',
                results: [
                    DataEntry.fromPartial({
                        boolValue: false,
                        key: 'strictBool'
                    }),

                    DataEntry.fromPartial({
                        boolValue: true,
                        key: 'castBool'
                    })
                ],
                assetOperations: []
            }
        )
    })

    it('should apply binary value', async () => {
        class TestContract {
            @State state: ContractState

            @Action
            test() {
                this.state.setBinary('strictBinary', new Uint8Array([22, 8, 322]))
                this.state.set('castBinary', new Uint8Array([21, 8, 322]))
            }
        }

        const tx = mockRespTx('test').transaction!;
        const ec = mockExecutionContext(tx)

        const processor = new ContractProcessor(
            TestContract,
            ec.rpcConnection,
        );

        await processor.handleIncomingTx(ec.incomingTxResp)

        expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
            {
                txId: 'some-tx-id',
                results: [
                    DataEntry.fromPartial({
                        binaryValue: new Uint8Array([22, 8, 322]),
                        key: 'strictBinary'
                    }),

                    DataEntry.fromPartial({
                        binaryValue: new Uint8Array([21, 8, 322]),
                        key: 'castBinary'
                    })
                ],
                assetOperations: []
            }
        )
    })
})