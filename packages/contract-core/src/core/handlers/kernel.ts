import { ContractTransactionResponse } from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'
import { StaticPool } from '../../utils/workers/static-pool'
import { ContractClient, envConfig, RPC } from '../../grpc'
import { logger } from '../common/logger'
import * as path from 'path'
import { TransactionConverter } from '../converters/transaction'
import { IncomingTransactionResp } from '../types/core'

export class Kernel {
    log = logger(this)

    private transactionConverter = new TransactionConverter()

    private workerPool: StaticPool
    private rpc: RPC
    private contractClient: ContractClient

    constructor({ contractPath }: { contractPath: string }) {
      this.workerPool = new StaticPool({
        task: path.join(__dirname, './worker.js'),
        size: 2,
        contractPath: path.join(process.cwd(), 'dist', contractPath),
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
      this.log.info(JSON.stringify(resp))

      if (!resp.transaction) {
        throw new Error('Transaction not provided')
      }

      try {
        await this.workerPool.runTask<IncomingTransactionResp, unknown>({
          authToken: resp.authToken,
          tx: this.transactionConverter.parse(resp.transaction),
        })
      } catch (e) {
        this.log.error('Worker execution error', e)
      }
    }
}