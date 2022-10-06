import { Action, ContractState, ExecutionContext, State } from '../src'
import { RPC } from '../src/grpc'
import { TransactionConverter } from '../src/core/converters/transaction'
import { mockRespTx } from './mocks/contract-transaction-response'
import { DataEntry } from '@wavesenterprise/js-contract-grpc-client/data_entry'
import {
  ContractKeyRequest,
  ContractTransaction,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { ContractProcessor } from '../src/core/execution/contract-processor'
import { Var } from '../src/core/decorators/var'

jest.spyOn(RPC.prototype, 'Contract', 'get')
  .mockReturnValue({
    setAuth() {
    },
    commitExecutionSuccess: jest.fn((_args) => {
      // console.log(args)
    }),
    commitExecutionError: jest.fn((_args) => {
      // console.log(args)
    }),

    getContractKey: jest.fn((_args) => {
      // console.log(args)
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)


jest.spyOn(ContractProcessor.prototype, 'tryCommitError')
jest.spyOn(RPC.prototype, 'saveClient')
  .mockImplementation(() => {
  })

describe('State', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpc = new RPC({} as unknown as any)
  let txCnv: TransactionConverter

  function mockExecutionContext(tx: ContractTransaction) {
    return new ExecutionContext({
      authToken: '',
      tx: txCnv.parse(tx),
    }, rpc)
  }


  beforeEach(() => {
    txCnv = new TransactionConverter()
  })

  describe('ContractState', () => {
    it('should set string value', async () => {
      class TestContract {
        @State state: ContractState

        @Action
        test() {
          this.state.setString('strictString', 'str')
          this.state.set('castString', 'str1')
        }
      }

      const tx = mockRespTx('test').transaction!
      const ec = mockExecutionContext(tx)

      const processor = new ContractProcessor(
        TestContract,
        ec.rpcConnection,
      )

      await processor.handleIncomingTx(ec.incomingTxResp)

      expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
        {
          txId: 'some-tx-id',
          results: [
            DataEntry.fromPartial({
              stringValue: 'str',
              key: 'strictString',
            }),
            DataEntry.fromPartial({
              stringValue: 'str1',
              key: 'castString',
            }),
          ],
          assetOperations: [],
        },
      )
    })

    it('should set int value', async () => {
      class TestContract {
        @State state: ContractState

        @Action
        test() {
          this.state.setInt('strictInt', 100)
          this.state.set('castInt', 1001)
        }
      }

      const tx = mockRespTx('test').transaction!
      const ec = mockExecutionContext(tx)

      const processor = new ContractProcessor(
        TestContract,
        ec.rpcConnection,
      )

      await processor.handleIncomingTx(ec.incomingTxResp)

      expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
        {
          txId: 'some-tx-id',
          results: [
            DataEntry.fromPartial({
              intValue: 100,
              key: 'strictInt',
            }),

            DataEntry.fromPartial({
              intValue: 1001,
              key: 'castInt',
            }),
          ],
          assetOperations: [],
        },
      )
    })

    it('should set boolean value', async () => {
      class TestContract {
        @State state: ContractState

        @Action
        test() {
          this.state.setBool('strictBool', false)
          this.state.set('castBool', true)
        }
      }

      const tx = mockRespTx('test').transaction!
      const ec = mockExecutionContext(tx)

      const processor = new ContractProcessor(
        TestContract,
        ec.rpcConnection,
      )

      await processor.handleIncomingTx(ec.incomingTxResp)

      expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
        {
          txId: 'some-tx-id',
          results: [
            DataEntry.fromPartial({
              boolValue: false,
              key: 'strictBool',
            }),

            DataEntry.fromPartial({
              boolValue: true,
              key: 'castBool',
            }),
          ],
          assetOperations: [],
        },
      )
    })

    it('should set binary value', async () => {
      class TestContract {
        @State state: ContractState

        @Action
        test() {
          this.state.setBinary('strictBinary', new Uint8Array([22, 8, 322]))
          this.state.set('castBinary', new Uint8Array([21, 8, 322]))
        }
      }

      const tx = mockRespTx('test').transaction!
      const ec = mockExecutionContext(tx)

      const processor = new ContractProcessor(
        TestContract,
        ec.rpcConnection,
      )

      await processor.handleIncomingTx(ec.incomingTxResp)

      expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
        {
          txId: 'some-tx-id',
          results: [
            DataEntry.fromPartial({
              binaryValue: new Uint8Array([22, 8, 322]),
              key: 'strictBinary',
            }),

            DataEntry.fromPartial({
              binaryValue: new Uint8Array([21, 8, 322]),
              key: 'castBinary',
            }),
          ],
          assetOperations: [],
        },
      )
    })
  })

  describe('Properties', () => {
    class TestContract {
      @Var() myVar: { get(): unknown, set(v: unknown): void }
      @Var({ mutable: false }) immutable: { get(): unknown, set(v: unknown): void }

      @Action
      test() {
        this.myVar.set('test')
      }

      @Action
      async getterTest() {
        await this.myVar.get()
      }

      @Action
      immutableTest() {
        this.immutable.set('testValue')
      }
    }

    it('should throw error on try set immutable', async function () {
      const tx = mockRespTx('immutableTest').transaction!
      const ec = mockExecutionContext(tx)

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )


      await processor.handleIncomingTx(ec.incomingTxResp)

      expect(processor.tryCommitError).toBeCalled()
    })

    it('should get value by propertyKey', async function () {
      const tx = mockRespTx('getterTest').transaction!
      const ec = mockExecutionContext(tx)

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )

      await processor.handleIncomingTx(ec.incomingTxResp)

      expect(rpc.Contract.getContractKey).toBeCalledWith(
        ContractKeyRequest.fromPartial({
          contractId: 'test-contract',
          key: 'myVar',
        }),
      )
    })

    it('should initialize proxy state value', async function () {
      const tx = mockRespTx('test').transaction!
      const ec = mockExecutionContext(tx)

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )

      await processor.handleIncomingTx(ec.incomingTxResp)

      expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
        {
          txId: 'some-tx-id',
          results: [
            DataEntry.fromPartial({
              stringValue: 'test',
              key: 'myVar',
            }),

          ],
          assetOperations: [],
        },
      )
    })
  })
})