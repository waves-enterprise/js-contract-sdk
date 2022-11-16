import {
  ContractTransaction,
  ContractTransactionResponse,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { ProcessTransactionTask } from './types'
import { WorkerPool } from '../utils/workers/static-pool'
import path from 'path'
import { ContractClient, envConfig, RPC } from '../grpc'
import { logger } from '../api'
import { getCpusCount } from '../utils'

export type ContractConfig = {
  contractPath: string,
  concurrencyLevel?: number,
}

export class ContractService {
  logger = logger(this)

  private workerPool: WorkerPool<ProcessTransactionTask, void>
  private rpc: RPC
  private contractClient: ContractClient

  constructor(private config: ContractConfig) {
    this.workerPool = new WorkerPool<ProcessTransactionTask, void>({
      filename: path.join(__dirname, './worker.js'),
      size: config.concurrencyLevel ?? getCpusCount() - 1,
      contractPath: config.contractPath,
    })

    this.rpc = new RPC(envConfig())
    this.contractClient = this.rpc.Contract
  }

  start() {
    this.contractClient.connect()
    this.contractClient.addResponseHandler(this.handle)
    this.logger.verbose('Contract client connected')
  }

  handle = async (resp: ContractTransactionResponse) => {
    this.logger.verbose('Handling tx')

    if (!resp.transaction) {
      throw new Error('Transaction not provided')
    }

    try {
      this.logger.verbose('Sending task to worker pool', resp.transaction.id)
      await this.workerPool.execute({
        authToken: resp.authToken,
        tx: ContractTransaction.toJSON(resp.transaction) as object,
      })
      this.logger.verbose('Worker processed task', resp.transaction.id)
    } catch (e) {
      this.logger.error('Worker execution error', e.message)
    }
  }
}
