import { Constructable } from '../../intefaces/helpers'
import { ContractExecutable, SandboxContract } from '../types'
import { Executor } from '../executor'

export class Test implements SandboxContract {
  constructor(
    public address: string,
    public targetExecutable: ContractExecutable,
  ) {
  }

  static createFromAddress(address: string, executable: Constructable<ContractExecutable>) {
    return new Test(address, executable)
  }

  invokeRequestDeposit(
    executor: Executor,
    amount: number,
    assetId: string,
    targetAddress: string,
  ) {
    return executor.invoke({
      call: 'requestDeposit',
      params: {
        amount,
        assetId,
        targetAddress,
      },
    })
  }

  invokeConfirmDeposit(
    executor: Executor,
    requestId: string,
  ) {
    return executor.invoke({
      call: 'confirmDeposit',
      params: {
        requestId,
      },
    })
  }

  invokeMintBankCheques(
    executor: Executor,
    amount: number,
    assetName: string,
  ) {
    return executor.invoke({
      call: 'mintBankCheques',
      payments: [],
      params: {
        amount,
        assetName,
      },
    })
  }

  invokeCreateCheque(
    executor: Executor,
    amount: number,
    assetId: string,
    targetAddress: string,
  ) {
    return executor.invoke({
      call: 'createCheque',
      payments: [],
      params: {
        amount,
        assetId,
        targetAddress,
      },
    })
  }
}
