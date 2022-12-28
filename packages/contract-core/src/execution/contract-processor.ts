import { ExecutionContext } from './execution-context'
import { ERROR_CODE } from './constants'
import { Container, logger, preload } from '../api'
import { ParamsExtractor } from './params-extractor'
import { setContractEntries } from './reflect'
import { ContractError } from './exceptions'
import { GrpcClient } from '../grpc/grpc-client'
import { ContractTransactionResponse } from '@wavesenterprise/we-node-grpc-api'
import { ContractAssetOperation } from '@wavesenterprise/js-contract-grpc-client/contract_asset_operation'

export function clearPreloadedEntries(contract: object): void {
  return setContractEntries(contract, new Map())
}

export class ContractProcessor {
  logger = logger(this)

  private readonly paramsExtractor = new ParamsExtractor()

  constructor(
    private readonly contract: unknown,
    private readonly grpcClient: GrpcClient,
  ) {
  }

  async handleIncomingTx(resp: ContractTransactionResponse): Promise<unknown> {
    this.grpcClient.setMetadata({
      authorization: resp.authToken,
    })
    const executionContext = new ExecutionContext(resp, this.grpcClient)

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
    const assetOperations = executionContext.assets.getOperations()
    const result = {
      txId: executionContext.txId,
      results,
      assetOperations: assetOperations.map(ContractAssetOperation.fromPartial),
    }
    this.logger.verbose('Commiting success with params', result)
    try {
      await this.grpcClient.contractService.commitExecutionSuccess(result)
    } catch (e) {
      await this.tryCommitError(executionContext, e)
    }
  }

  tryCommitError(executionContext: ExecutionContext, e: ContractError) {
    this.logger.error('Committing Error ' + (e.code || ERROR_CODE.FATAL), e.message)
    this.logger.verbose(e)

    return this.grpcClient.contractService.commitExecutionError({
      txId: executionContext.txId,
      message: e.message || 'Unhandled error',
      code: e.code || ERROR_CODE.FATAL,
    })
  }
}
