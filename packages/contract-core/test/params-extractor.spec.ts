import {ExecutionContext} from '../src/execution'
import {ContractClient, RPC, RPCConnectionConfig} from '../src/grpc'
import {mockRespTx} from './mocks/contract-transaction-response'
import {DataEntry} from '@wavesenterprise/js-contract-grpc-client/data_entry'
import {Action, AttachedPayments, Contract, Param, Payments, Container, Ctx} from '../src'
import {ParamsExtractor} from '../src/execution/params-extractor'
import BN from 'bn.js'
import {ContractTransaction} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";

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
  } as unknown as ContractClient)

jest.spyOn(RPC.prototype, 'saveClient')
  .mockImplementation(() => {
  })


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

    const tx = mockRespTx('test').transaction!
    const incomingTx = ContractTransaction.toJSON(tx)

    const ec = new ExecutionContext({
      authToken: '',
      tx: incomingTx,
    }, new RPC({} as unknown as RPCConnectionConfig))

    Container.set(ec)

    const {args} = extractor.extract(TestContract, ec);



    expect((args[0] as AttachedPayments)[0].assetId).toEqual('test')
    expect((args[0] as AttachedPayments)[0].amount.toNumber()).toEqual(10000)
  });

  it('should apply @Ctx decorator to action', function () {
    @Contract()
    class TestContract {
      @Action
      test(
        @Ctx ctx: ExecutionContext,
        @Payments payments: AttachedPayments
      ) {
        console.log(ctx,payments)
      }
    }

    const tx = mockRespTx('test').transaction!
    const incomingTx = ContractTransaction.toJSON(tx)

    const ec = new ExecutionContext({
      authToken: '',
      tx: incomingTx,
    }, new RPC({} as unknown as RPCConnectionConfig))

    Container.set(ec)

    const {args} = extractor.extract(TestContract, ec);
    expect(args[0]).toEqual(ec)
  });

  it('should apply @Param decorator to action ', () => {
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

    const incomingTx = ContractTransaction.toJSON(tx)

    const ec = new ExecutionContext({
      authToken: '',
      tx: incomingTx,
    }, new RPC({} as unknown as RPCConnectionConfig))

    const {args} = extractor.extract(TestContract, ec)

    expect(args[0]).toEqual('testValue')
    expect((args[1] as BN).toNumber()).toEqual(2)
  })
})