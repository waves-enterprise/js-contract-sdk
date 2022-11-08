import { ExecutionContext } from '../src/execution'
import { RPC } from '../src/grpc'
import { mockRespTx } from './mocks/contract-transaction-response'
import { DataEntry } from '@wavesenterprise/js-contract-grpc-client/data_entry'
import { Action, Contract, Param, TInt } from '../src'
import { convertContractTransaction } from '../src/execution/converter'
import { ParamsExtractor } from '../src/execution/params-extractor'
import BN from 'bn.js'


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
  } as unknown)

jest.spyOn(RPC.prototype, 'addClient')
  .mockImplementation(() => {
  })


describe('State', () => {
  let extractor: ParamsExtractor

  beforeAll(() => {
    extractor = new ParamsExtractor()
  })

  it('should apply decorator to class ', () => {
    @Contract()
    class TestContract {
      @Action
      test(
      @Param('key') value: string,
        @Param('next') big: BN,
        @Param('binary') buf: Buffer,
      ) {

      }
    }

    const tx = mockRespTx('test').transaction!

    tx.params.push(
      DataEntry.fromPartial({
        stringValue: 'testValue',
        key: 'key',
      }),
      DataEntry.fromPartial({
        intValue: 2,
        key: 'next',
      }),
      DataEntry.fromPartial({
        binaryValue: new Uint8Array([2, 3, 4, 1]),
        key: 'binary',
      }),
    )

    const incomingTx = convertContractTransaction(tx)

    const ec = new ExecutionContext({
      authToken: '',
      tx: incomingTx,
    }, new RPC({} as unknown as unknown))

    const { args } = extractor.extract(TestContract, ec)

    expect(args[0]).toEqual('testValue')
    expect((args[1] as BN).toNumber()).toEqual(2)
  })
})