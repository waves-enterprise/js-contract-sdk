import {
  Action,
  Contract,
  ContractMapping,
  ContractState,
  ContractValue,
  ExecutionContext,
  preload,
  State,
  Var,
} from '../src'
import { mockAction } from './mocks/contract-transaction-response'
import { ContractKeysRequest } from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { createContractProcessor } from './mocks/contract-processor'
import Long from 'long'
import { ContractService } from '@wavesenterprise/we-node-grpc-api'


describe('State', () => {

  beforeEach(() => {
    jest.restoreAllMocks();
  })

  describe('ContractState', () => {

    it('should set string value', async () => {
      class TestContract {
        @State state: ContractState

        @Action
        test() {
          this.state.set('str', 'str1')
          this.state.set('int', 100)
          this.state.set('bool', false)
          this.state.set('bin', new Uint8Array([0, 1, 2]))
        }
      }

      const resp = mockAction('test')

      const { processor, success } = createContractProcessor(TestContract)

      await processor.handleIncomingTx(resp)

      const context = success.mock.calls[0][0] as ExecutionContext

      expect(context.state.getUpdatedEntries()).toEqual([
        {
          key: 'str',
          stringValue: 'str1',
        },
        {
          key: 'int',
          intValue: new Long(100),
        },
        {
          key: 'bool',
          boolValue: false,
        },
        {
          key: 'bin',
          binaryValue: new Uint8Array([0, 1, 2]),
        },
      ])
    })
  })

  describe('Properties', () => {
    @Contract()
    class TestContract {
      @Var() intVar: ContractValue<number>
      @Var() decimalVar: ContractValue<number>
      @Var() myVar: ContractValue<string>
      @Var() user: ContractMapping<string>

      @Action
      test() {
        this.myVar.set('test')
        this.user.set('user1', 'value1')
      }

      @Action
      async getterTest() {
        await this.myVar.get()
        await this.user.get('user1')
      }

      @Action
      async preloadInActionVars() {
        await preload(this, ['intVar', 'decimalVar', ['user', 'user1']])

        await this.intVar.get()
        await this.decimalVar.get()
        await this.user.get('user1')
      }
    }

    it('should get value by propertyKey', async function () {
      const resp = mockAction('getterTest')

      const { processor } = createContractProcessor(TestContract)
      const getKey = jest.spyOn(ContractService.prototype, 'getContractKey')
        .mockImplementationOnce(() => Promise.resolve({
          key: 'myVar',
          stringValue: 'test',
        }))
        .mockImplementationOnce(() => Promise.resolve({
          key: 'user_user1',
          stringValue: 'nice',
        }))
      await processor.handleIncomingTx(resp)
      expect(getKey).toHaveBeenCalledTimes(2)
      expect(getKey).toHaveBeenNthCalledWith(2,
        {
          contractId: 'test-contract',
          key: 'user_user1',
        },
      )
      expect(getKey).toHaveBeenNthCalledWith(1,
        {
          contractId: 'test-contract',
          key: 'myVar',
        },
      )
    })

    it('should initialize proxy state value', async function () {
      const resp = mockAction('test')

      const { processor, success } = createContractProcessor(TestContract)

      await processor.handleIncomingTx(resp)

      const context = success.mock.calls[0][0] as ExecutionContext

      expect(context.state.getUpdatedEntries()).toEqual([
        {
          key: 'myVar',
          stringValue: 'test',
        },
        {
          key: 'user_user1',
          stringValue: 'value1',
        },
      ])
    })

    it('should preload keys in a batch request', async function () {
      const resp = mockAction('preloadInActionVars')

      const { processor } = createContractProcessor(TestContract)
      const getKeys = jest.spyOn(ContractService.prototype, 'getContractKeys')
        .mockImplementation(() => Promise.resolve([
          {
            key: 'intVar',
            intValue: new Long(10),
          },
          {
            key: 'decimalVar',
            intValue: new Long(20),
          },
          {
            key: 'user_user1',
            stringValue: 'nice',
          },
        ]))
      const getKey = jest.spyOn(ContractService.prototype, 'getContractKey')
        .mockImplementation(() => Promise.resolve({
          key: '',
          intValue: new Long(0),
        }))
      await processor.handleIncomingTx(resp)

      expect(getKeys).toBeCalledWith(
        ContractKeysRequest.fromPartial({
          contractId: 'test-contract',
          keysFilter: {
            keys: ['intVar', 'decimalVar', 'user_user1'],
          },
        }),
      )
      expect(getKey).not.toHaveBeenCalled()
    })
  })
})
