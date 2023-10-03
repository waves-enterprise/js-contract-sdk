import { ContractProcessor } from '../execution/contract-processor'
import { txFactory } from './environment/response-factory'
import { ContractExecutable } from './types'
import { Keypair } from '@wavesenterprise/signer'
import * as marshal from '../utils/marshal'


export class Executor {
  processor: ContractProcessor
  sender: Keypair

  constructor(private executable: ContractExecutable) {
  }

  setProcessor(cp: ContractProcessor) {
    this.processor = cp
  }

  setSender(kp: Keypair) {
    this.sender = kp
  }

  async invoke(params: {
    call: string,
    params?: Record<string, unknown>,
    payments?: Array<{ assetId?: string, amount: number }>,

  }): Promise<string> {
    const {
      call,
      params: txParams,
      ...tx
    } = params

    const response = await txFactory({
      ...tx,
      action: call,
      sender: this.sender,
      contractId: this.executable.name,
      params: txParams ? marshal.params(txParams) : undefined,
    })

    await this.processor.handleIncomingTx(response)

    return response.transaction.id
  }
}
