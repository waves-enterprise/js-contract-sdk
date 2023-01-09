import { ExecutionContext } from '../src/execution'
import { mockAction } from './mocks/contract-transaction-response'
import { Action, AttachedPayments, Container, Contract, Ctx, Param, Payments } from '../src'
import { ParamsExtractor } from '../src/execution/params-extractor'
import Long from 'long'
import { createGrpcClient } from './mocks/grpc-client'


describe('Param Extractors', () => {
  let extractor: ParamsExtractor

  beforeAll(() => {
    extractor = new ParamsExtractor()
  })


  it('should apply @Payments decorator to action', function () {
    @Contract()
    class TestContract {
      @Action
      test(
        @Payments attachedPayments: AttachedPayments,
      ) {
        console.log(attachedPayments)
      }
    }

    const ec = new ExecutionContext(mockAction('test'), createGrpcClient())

    Container.set(ec)

    const { args } = extractor.extract(TestContract, ec)


    expect((args[0] as AttachedPayments)[0].assetId).toEqual('test')
    expect((args[0] as AttachedPayments)[0].amount.toNumber()).toEqual(10000)
  })

  it('should apply @Ctx decorator to action', function () {
    @Contract()
    class TestContract {
      @Action
      test(
        @Ctx ctx: ExecutionContext,
        @Payments payments: AttachedPayments,
      ) {
        console.log(ctx, payments)
      }
    }

    const ec = new ExecutionContext(mockAction('test'), createGrpcClient())

    Container.set(ec)

    const { args } = extractor.extract(TestContract, ec)
    expect(args[0]).toEqual(ec)
  })

  it('should apply @Param decorator to action ', () => {
    @Contract()
    class TestContract {
      @Action
      test(
        @Param('key') value: string,
        @Param('next') big: Long,
        @Param('binary') buf: Buffer,
      ) {

      }
    }

    const tx = mockAction('test')

    tx.transaction.params.push(
      {
        stringValue: 'testValue',
        key: 'key',
      },
      {
        intValue: new Long(2),
        key: 'next',
      },
      {
        binaryValue: new Uint8Array([2, 3, 4, 1]),
        key: 'binary',
      },
    )

    const ec = new ExecutionContext(tx, createGrpcClient())

    const { args } = extractor.extract(TestContract, ec)

    expect(args[0]).toEqual('testValue')
    expect((args[1] as Long).toNumber()).toEqual(2)
  })
})
