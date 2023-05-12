import {Constructable} from '../../intefaces/helpers'
import {ContractExecutable} from '../blockchain'
import {Executor} from '../executor'

export interface Contract {
  targetExecutable: ContractExecutable,
}

export class Test implements Contract {
  constructor(address: string, public targetExecutable: ContractExecutable) {
  }

  static createFromAddress(address: string, executable: Constructable<ContractExecutable>) {
    return new Test(address, executable)
  }

  async invokeTest(executor: Executor) {
    const txId = await executor.invoke({call: 'test', params: {}, payments: [{amount: 1000}]})
  }

  async invokeNotExist(executor: Executor) {
    await executor.invoke({call: 'NotExist', params: {}})
  }
}