import 'reflect-metadata'
import {
  ContractTransaction,
  ContractTransactionResponse
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { ContractProcessor } from '../src/execution/contract-processor'
import {Action, Contract, Ctx, Payments, AttachedPayments} from '../src'
import Long from 'long'
import { ContractTransferIn } from '@wavesenterprise/js-contract-grpc-client/contract_transfer_in'
import {
  ContractError,
  ExecutionContext,
  RetryableError,
  UnavailableContractActionException,
  UnavailableContractParamException,
} from '../src/execution'

@Contract()
class ExampleContract {
  @Action()
  test() {

  }

  @Action()
  fatal() {
    throw new ContractError('Somethin went wrong')
  }

  @Action()
  retryable() {
    throw new RetryableError('Somethin went wrong')
  }


  @Action()
  params(
    @Payments payments: AttachedPayments,
    @Ctx ctx: ExecutionContext,
  ) {

    console.log(ctx, payments)
  }
}

function mockAction(name: string) {
  return ContractTransactionResponse.fromPartial({
    authToken: 'test-token',
    transaction: ContractTransaction.fromPartial({
      id: 'some-tx-id',
      type: 104,
      sender: 'iam',
      senderPublicKey: 'mypc',
      contractId: 'test-contract',
      params: [
        {
          stringValue: name,
          key: 'action',
        },
      ],
      fee: Long.fromInt(1) as unknown as number, // todo long
      version: 5,
      proofs: new Uint8Array(),
      timestamp: new Date().getTime(),
      feeAssetId: {
        value: 'WAVES',
      },
      payments: [
        ContractTransferIn.fromPartial({
          amount: 1000000,
        }),
        ContractTransferIn.fromPartial({
          amount: 1000000,
          assetId: 'assetId',
        }),
      ],
    }),
  })
}


describe('ContractProcessor', () => {
  const rpc = new RPC({} as unknown as RPCConnectionConfig)
  const contractClient = rpc.Contract

  let mockResp: ContractTransactionResponse
  const processor = new ContractProcessor(ExampleContract, rpc)

  beforeAll(() => {
    mockResp = ContractTransactionResponse.fromPartial({
      authToken: 'test-token',
      transaction: {
        id: 'some-tx-id',
        type: 104,
        sender: 'iam',
        senderPublicKey: 'mypc',
        contractId: 'test-contract',
        params: [
          {
            stringValue: 'test',
            key: 'action',
          },
          {
            stringValue: 'some-key-value',
            key: 'some-key',
          },
        ],
        fee: Long.fromInt(1) as unknown as number,
        version: 5,
        proofs: new Uint8Array(),
        timestamp: new Date().getTime(),
        feeAssetId: {
          value: 'WAVES',
        },
        payments: [
          ContractTransferIn.fromPartial({
            amount: 1000000,
          }),
          ContractTransferIn.fromPartial({
            amount: 1000000,
            assetId: 'assetId',
          }),
        ],
      },
    })
  })

  it('should execute test action successfully', async function () {
    await processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON(mockResp.transaction!) })

    expect(contractClient.commitExecutionSuccess).toBeCalled()
    expect(contractClient.commitExecutionError).not.toBeCalled()
  })


  it('should reject execution with not found action', async function () {
    const parsed = ContractTransaction.toJSON(mockAction('__').transaction!)

    expect(processor.handleIncomingTx({ authToken: 'test',  tx: parsed }))
      .rejects.toThrowError(UnavailableContractActionException)
  })

  it('should reject execution with not found param action in tx', async function () {
    const comockResp = ContractTransactionResponse.fromPartial({
      authToken: 'test-token',
      transaction: {
        id: 'some-tx-id',
        type: 104,
        sender: 'iam',
        senderPublicKey: 'mypc',
        contractId: 'test-contract',
        params: [],
        fee: Long.fromInt(1) as  unknown as number,
        version: 5,
        proofs: new Uint8Array(),
        timestamp: new Date().getTime(),
        payments: [],
      },
    })

    expect(processor.handleIncomingTx({ authToken: 'test', tx: ContractTransaction.toJSON((comockResp.transaction!)) }))
      .rejects.toThrowError(UnavailableContractParamException)
  })

  it('should reject execution by fatal error in contract action', async function () {
    const parsed = ContractTransaction.toJSON(mockAction('fatal').transaction!)

    await processor.handleIncomingTx({ authToken: 'test', tx: parsed })

    expect(contractClient.commitExecutionError).toBeCalledWith(
      { txId: 'some-tx-id', message: 'Somethin went wrong', code: 0 },
    )
  })

  it('should reject execution by retryable error in contract action', async function () {
    const parsed = ContractTransaction.toJSON(mockAction('retryable').transaction!)

    await processor.handleIncomingTx({ authToken: 'test', tx: parsed })

    expect(contractClient.commitExecutionError).toBeCalledWith(
      { txId: 'some-tx-id', message: 'Somethin went wrong', code: 1 },
    )
  })
})
