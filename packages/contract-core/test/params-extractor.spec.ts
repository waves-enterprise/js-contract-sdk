import { Action, ExecutionContext, Param } from '../src'
import { ContractActionArgumentsExtractor } from '../src/core/execution/extractors/arguments-extractor'
import { RPC } from '../src/grpc'
import { TransactionConverter } from '../src/core/converters/transaction'
import { mockRespTx } from './mocks/contract-transaction-response'
import { DataEntry } from '@wavesenterprise/js-contract-grpc-client/data_entry'
import { TInt } from '../src/core/data-types/integer'


jest.spyOn(RPC.prototype, 'Contract', 'get')
  .mockReturnValue({
    setAuth() {
    },
    commitExecutionSuccess: jest.fn(() => {
    }),
    commitExecutionError: jest.fn(() => {
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

jest.spyOn(RPC.prototype, 'saveClient')
  .mockImplementation(() => {
  })


describe('State', () => {
  let extractor: ContractActionArgumentsExtractor
  let txCnv: TransactionConverter

  beforeAll(() => {
    extractor = new ContractActionArgumentsExtractor()

    txCnv = new TransactionConverter()
  })

  it('should apply decorator to class ', () => {
    class TestContract {
      @Action
      test(
      @Param('key') _value: string,
        @Param('next') _big: TInt,
        @Param('binary') _buf: Buffer,
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

    const incomingTx = txCnv.parse(tx)

    const ec = new ExecutionContext({
      authToken: '',
      tx: incomingTx,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, new RPC({} as unknown as any))

    const args = extractor.extract(TestContract, ec, {
      name: 'test',
      propertyName: 'test',
      params: [],
    })

    expect(args[0]).toEqual('testValue')
    expect((args[1] as TInt).toNumber()).toEqual(2)
  })

})