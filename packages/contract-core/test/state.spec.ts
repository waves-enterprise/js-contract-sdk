import { Action, Contract, ContractState, preload, State, TVar, Var } from '../src'
import {ContractClient, RPC, RPCConnectionConfig} from '../src/grpc'
import { mockRespTx } from './mocks/contract-transaction-response'
import { DataEntry } from '@wavesenterprise/js-contract-grpc-client/data_entry'
import {
  ContractKeyRequest,
  ContractKeysRequest,
  ContractKeysResponse,
  ContractTransaction,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { ContractProcessor } from '../src/execution/contract-processor'
import { ParamsExtractor } from '../src/execution/params-extractor'
import * as Long from 'long'


const mockEntry = (key: string, valueKey: string, value: unknown) => {
  return DataEntry.fromPartial({
    key,
    [valueKey]: value,
  })
}

const stateMock = {
  'intVar': mockEntry('intVar', 'intValue', Long.fromValue(350677)),
  'decimalVar': mockEntry('decimalVar', 'intValue', Long.fromString('350677121231')),
}


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
    getContractKeys: jest.fn((req: ContractKeysRequest) => {


      return ContractKeysResponse.fromPartial({
        entries: req.keysFilter!.keys.map((key) => {
          return stateMock[key]
        }),
      })
    }),
    getContractKey: jest.fn((args) => {
      // console.log(args)
    }),
  } as unknown as ContractClient)


jest.spyOn(ContractProcessor.prototype, 'tryCommitError')
jest.spyOn(RPC.prototype, 'saveClient')
  .mockImplementation(() => {
  })

describe('State', () => {
  const rpc = new RPC({} as unknown as RPCConnectionConfig)
  let extractor: ParamsExtractor



  beforeEach(() => {
    extractor = new ParamsExtractor()
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

      const resp = mockRespTx('test')

      const processor = new ContractProcessor(
        TestContract,
        rpc
      )

      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })

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

      const resp = mockRespTx('test')

      const processor = new ContractProcessor(
        TestContract,
        rpc
      )

      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })

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

      const resp = mockRespTx('test')

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )

      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })

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

      const resp = mockRespTx('test')

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )

      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })

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
    @Contract()
    class TestContract {
            @Var() intVar: TVar<number>
            @Var() decimalVar: TVar<number>

            @Var() myVar: TVar<string>
            @Var({ mutable: false }) immutable: TVar<string>

            @Action
            test() {
              this.myVar.set('test')
            }

            @Action
            async getterTest() {
              await this.myVar.get()
            }

            @Action
            async immutableTest() {
              this.immutable.set('testValue')
            }

            @Action
            async preloadInAction() {
              await preload(this, ['myVar'])
            }

            @Action
            async preloadInActionVars() {
              await preload(this, ['intVar', 'decimalVar'])

              await this.intVar.get()
              await this.decimalVar.get()

              this.decimalVar.set(100)
            }
    }

    it('should throw error on try set immutable', async function () {
      const resp = mockRespTx('immutableTest')

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )


      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })


      expect(processor.tryCommitError).toBeCalled()
    })

    it('should get value by propertyKey', async function () {
      const resp = mockRespTx('getterTest')

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )

      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })

      expect(rpc.Contract.getContractKey).toBeCalledWith(
        ContractKeyRequest.fromPartial({
          contractId: 'test-contract',
          key: 'myVar',
        }),
      )
    })

    it('should initialize proxy state value', async function () {
      const resp = mockRespTx('test')

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )

      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })

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

    it('should batch preload state keys', async function () {
      const resp = mockRespTx('getterTest')

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )

      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })

      expect(rpc.Contract.getContractKey).toBeCalledWith(
        ContractKeyRequest.fromPartial({
          contractId: 'test-contract',
          key: 'myVar',
        }),
      )
    })

    it('should preload keys in a batch request', async function () {
      const resp = mockRespTx('preloadInAction')

      const processor = new ContractProcessor(
        TestContract,
        rpc,
      )

      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })

      expect(rpc.Contract.getContractKeys).toBeCalledWith(
        ContractKeysRequest.fromPartial({
          contractId: 'test-contract',
          keysFilter: {
            keys: ['myVar'],
          },
        }),
      )
    })
  })
})