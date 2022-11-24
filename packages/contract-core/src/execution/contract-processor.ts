import {
  ExecutionErrorRequest,
  ExecutionSuccessRequest,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { ExecutionContext } from './execution-context'
import { RPC } from '../grpc'
import { IncomingTransactionResp } from './types'
import { ERROR_CODE } from './constants'
import { Container, logger, preload } from '../api'
import { ParamsExtractor } from './params-extractor'
import { setContractEntries } from './reflect'
import { ContractError } from './exceptions'

export function clearPreloadedEntries(contract: object): void {
  return setContractEntries(contract, new Map())
}

export class ContractProcessor {
  logger = logger(this)

  private readonly paramsExtractor = new ParamsExtractor()

  constructor(private contract: unknown, private rpc: RPC) {
  }

  async handleIncomingTx(resp: IncomingTransactionResp): Promise<unknown> {
    const executionContext = new ExecutionContext(resp, this.rpc)

    Container.set(executionContext)
    const { args, actionMetadata } = this.paramsExtractor
      .extract(this.contract as ObjectConstructor, executionContext)

    const c = this.contract as ObjectConstructor
    const contractInstance = new c()
    clearPreloadedEntries(contractInstance)

    try {
      if (actionMetadata.preload) {
        await preload(contractInstance, actionMetadata.preload as keyof object)
      }
      await contractInstance[actionMetadata.propertyName](...args)

      return this.tryCommitSuccess(executionContext)
    } catch (e) {

      return this.tryCommitError(executionContext, e)
    }
  }

  async tryCommitSuccess(executionContext: ExecutionContext) {
    const results = executionContext.state.getUpdatedEntries()
    try {
      await this.rpc.Contract.commitExecutionSuccess(
        ExecutionSuccessRequest.fromPartial({
          txId: executionContext.txId,
          results,
          assetOperations: executionContext.assetOperations.operations,
        }),
      )
    } catch (e) {
      await this.tryCommitError(executionContext, e)
    }
  }

  tryCommitError(executionContext: ExecutionContext, e: ContractError) {
    this.logger.error('Committing Error ' + (e.code || ERROR_CODE.FATAL), e.message)
    this.logger.verbose(e)

    return this.rpc.Contract.commitExecutionError(
      ExecutionErrorRequest.fromPartial({
        txId: executionContext.txId,
        message: e.message || 'Unhandled error',
        code: e.code || ERROR_CODE.FATAL,
      }),
    )
  }
}
