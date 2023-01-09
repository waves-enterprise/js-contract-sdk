import 'reflect-metadata'
import { ContractProcessor } from '../src/execution/contract-processor'
import { Action, AttachedPayments, Contract, Ctx, Payments } from '../src'
import {
  ContractError,
  ExecutionContext,
  RetryableError,
  UnavailableContractActionException,
  UnavailableContractParamException,
} from '../src/execution'
import { createContractProcessor } from './mocks/contract-processor'
import { mockAction } from './mocks/contract-transaction-response'
import { ReservedParamNames } from '../src/execution/constants'

@Contract()
class TestContract {
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


describe('ContractProcessor', () => {

  it('should execute test action successfully', async function () {
    const { processor, success, error } = createContractProcessor(TestContract)
    await processor.handleIncomingTx(mockAction('test'))

    expect(success).toBeCalled()
    expect(error).not.toBeCalled()
  })


  it('should reject execution with not found action', async function () {
    const { processor, error } = createContractProcessor(TestContract)
    await processor.handleIncomingTx(mockAction('unknown'))

    expect(error).toHaveBeenCalledWith(expect.anything(), new UnavailableContractActionException('unknown'))
  })

  it('should reject execution with not found param action in tx', async function () {
    const { processor, error } = createContractProcessor(TestContract)
    const action = mockAction('unknown')
    action.transaction.params = []
    console.log(action)
    await processor.handleIncomingTx(action)

    expect(error).toHaveBeenCalledWith(expect.anything(), new UnavailableContractParamException(ReservedParamNames.action))
  })

  it('should reject execution by fatal error in contract action', async function () {
    const { processor, error } = createContractProcessor(TestContract)
    await processor.handleIncomingTx(mockAction('fatal'))

    expect(error).toHaveBeenCalledWith(expect.anything(), new ContractError('Somethin went wrong'))
  })

  it('should reject execution by retryable error in contract action', async function () {
    const { processor, error } = createContractProcessor(TestContract)
    await processor.handleIncomingTx(mockAction('fatal'))

    expect(error).toHaveBeenCalledWith(expect.anything(), new RetryableError('Somethin went wrong'))
  })
})
