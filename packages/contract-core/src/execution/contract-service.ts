import { ContractTransactionResponse } from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { IncomingTransactionResp } from './types'
import { StaticPool } from '../utils/workers/static-pool'
import path from 'path'
import { ContractClient, envConfig, RPC } from '../grpc'
import { logger } from '../api'
import { getCpusCount } from '../utils'
import { convertContractTransaction } from './converter'

export type ContractConfig = {
  contractPath: string,
  concurrencyLevel?: number,
}

export class ContractService {
    logger = logger(this)

    private workerPool: StaticPool
    private rpc: RPC
    private contractClient: ContractClient

    constructor(private config: ContractConfig) {
      this.workerPool = new StaticPool({
        task: path.join(__dirname, './worker.js'),
        size: config.concurrencyLevel || getCpusCount() - 1,
        contractPath: path.join(process.cwd(), 'dist', config.contractPath),
      })

      this.rpc = new RPC(envConfig())
      this.contractClient = this.rpc.Contract
    }

    async start() {
      const isReady = await this.workerPool.workersReady

      if (isReady) {
        this.contractClient.connect()
        this.contractClient.addResponseHandler(this.handle)
      }
    }

    handle = async (resp: ContractTransactionResponse) => {
      this.logger.info(JSON.stringify(resp))

      if (!resp.transaction) {
        throw new Error('Transaction not provided')
      }

      try {
        await this.workerPool.runTask<IncomingTransactionResp, unknown>({
          authToken: resp.authToken,
          tx: convertContractTransaction(resp.transaction),
        })
      } catch (e) {
        this.logger.error('Worker execution error', e)
      }
    }
}
