import 'reflect-metadata'
import { ContractTransactionResponse } from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { RPC } from '../src/grpc'
import { ContractProcessor } from '../src/execution/contract-processor'
import { Action, Contract, Param } from '../src'
import Long from 'long'
import { ContractTransferIn } from '@wavesenterprise/js-contract-grpc-client/contract_transfer_in'
import {
  ContractError,
  RetryableError,
  UnavailableContractActionException,
  UnavailableContractParamException,
} from '../src/execution'
import { convertContractTransaction } from '../src/execution/converter'

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
  @Param('key') value: string,
  ) {

    console.log(value)

  }
}


function mockRespTx(name: string) {
  return ContractTransactionResponse.fromPartial({
    authToken: 'test-token',
    transaction: {
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
      version: 4,
      proofs: new Uint8Array(),
      timestamp: new Date().getTime(),
    },
  })
}


function mockAction(name: string) {
  return ContractTransactionResponse.fromPartial({
    authToken: 'test-token',
    transaction: {
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
      fee: Long.fromInt(1) as unknown,
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
}


describe('ContractProcessor', () => {
  const rpc = new RPC({} as unknown)
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
        fee: Long.fromInt(1) as unknown,
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
    const parsed = convertContractTransaction(mockResp.transaction!)
    await processor.handleIncomingTx({ authToken: 'test', tx: parsed })

    expect(contractClient.commitExecutionSuccess).toBeCalled()
    expect(contractClient.commitExecutionError).not.toBeCalled()
  })


  it('should reject execution with not found action', async function () {
    const parsed = convertContractTransaction(mockAction('__').transaction!)

    expect(processor.handleIncomingTx({ authToken: 'test', tx: parsed }))
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
        fee: Long.fromInt(1) as unknown,
        version: 5,
        proofs: new Uint8Array(),
        timestamp: new Date().getTime(),
        payments: [],
      },
    })

    expect(processor.handleIncomingTx({ authToken: 'test', tx: convertContractTransaction(comockResp.transaction!) }))
      .rejects.toThrowError(UnavailableContractParamException)
  })

  it('should reject execution by fatal error in contract action', async function () {
    const parsed = convertContractTransaction(mockAction('fatal').transaction!)

    await processor.handleIncomingTx({ authToken: 'test', tx: parsed })

    expect(contractClient.commitExecutionError).toBeCalledWith(
      { txId: 'some-tx-id', message: 'Somethin went wrong', code: 0 },
    )
  })

  it('should reject execution by retryable error in contract action', async function () {
    const parsed = convertContractTransaction(mockAction('retryable').transaction!)

    await processor.handleIncomingTx({ authToken: 'test', tx: parsed })

    expect(contractClient.commitExecutionError).toBeCalledWith(
      { txId: 'some-tx-id', message: 'Somethin went wrong', code: 1 },
    )
  })
})