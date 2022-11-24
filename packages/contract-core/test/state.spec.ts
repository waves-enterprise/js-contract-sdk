import { Action, Contract, ContractMapping, ContractState, ContractValue, preload, State, Var } from '../src'
import { ContractClient, RPC, RPCConnectionConfig } from '../src/grpc'
import { mockRespTx } from './mocks/contract-transaction-response'
import { DataEntry } from '@wavesenterprise/js-contract-grpc-client/data_entry'
import {
  ContractKeyRequest,
  ContractKeysRequest,
  ContractKeysResponse,
  ContractTransaction,
  ExecutionSuccessRequest,
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


jest.mock('../src/grpc/clients/address-client')
jest.mock('../src/grpc/clients/contract-client')
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
          this.state.set('castString', 'str1')
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
          this.state.set('castInt', 1001)
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
      @Var() intVar: ContractValue<number>
      @Var() decimalVar: ContractValue<number>

      @Var() myVar: ContractValue<string>

      @Action
      test() {
        this.myVar.set('test')
      }

      @Action
      async getterTest() {
        await this.myVar.get()
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


    it('should initialize mapping', async function () {
      @Contract()
      class TestingContract {
        @Var() user: ContractMapping<string>

        @Action()
        mappingTest() {

          this.user.set('first', 'user1')
          this.user.set('second', 'user2')
        }
      }

      const resp = mockRespTx('mappingTest')

      const processor = new ContractProcessor(
        TestingContract,
        rpc,
      )

      await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!) })

      expect(rpc.Contract.commitExecutionSuccess).toBeCalledWith(
        ExecutionSuccessRequest.fromPartial({
          txId: 'some-tx-id',
          assetOperations: [],
          results: [
            DataEntry.fromPartial({
              key: 'user_first',
              stringValue: 'user1',
            }),
            DataEntry.fromPartial({
              key: 'user_second',
              stringValue: 'user2',
            }),
          ],
        }),
      )
    })
  })
})
