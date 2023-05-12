import {ContractProcessor} from "../execution/contract-processor";
import {txFactory} from "./environment/response-factory";
import {ContractExecutable} from "./blockchain";


export class Executor {
  contractProcessor: ContractProcessor

  constructor(private target: ContractExecutable) {
  }

  setProcessor(cp: ContractProcessor) {
    this.contractProcessor = cp;
  }


  async get() {

  }

  async invoke(params: { call: string, params?: object, payments?: { assetId?: string, amount: number }[] }): Promise<string> {
    const {
      call,
      ...tx
    } = params;

    const response = txFactory({
      action: call,
      ...tx,
      contractId: this.target.name
    });

    await this.contractProcessor.handleIncomingTx(response)

    return response.transaction.id
  }
}