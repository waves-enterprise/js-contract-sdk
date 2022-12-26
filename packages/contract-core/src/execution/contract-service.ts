import { WorkerPool } from '../utils/workers/static-pool'
import path from 'path'
import { logger } from '../api'
import { getCpusCount } from '../utils'
import { GrpcClient } from '../grpc/grpc-client'
import { CONNECTION_ID, CONNECTION_TOKEN, NODE_ADDRESS } from '../grpc/config'
import { ClientReadableStream } from '@grpc/grpc-js'
import { ContractTransactionResponse } from '@wavesenterprise/we-node-grpc-api'

export type ContractConfig = {
  contractPath: string,
  concurrencyLevel?: number,
}

export class ContractService {
  log = logger(this)

  private readonly workerPool: WorkerPool<ContractTransactionResponse, void>
  private readonly grpcClient: GrpcClient
  private connection: ClientReadableStream<ContractTransactionResponse>

  constructor(private config: ContractConfig) {
    this.workerPool = new WorkerPool<ContractTransactionResponse, void>({
      filename: path.join(__dirname, './worker.js'),
      size: config.concurrencyLevel ?? getCpusCount() - 1,
      contractPath: config.contractPath,
    })
    this.grpcClient = new GrpcClient({
      connectionToken: CONNECTION_TOKEN,
      nodeAddress: NODE_ADDRESS,
    })
  }

  start() {
    this.grpcClient.setMetadata({
      authorization: '',
    })
    this.connection = this.grpcClient.contractService.connect({
      connectionId: CONNECTION_ID,
    })
    this.connection.on('close', () => {
      this.log.verbose('Connection stream closed')
    })
    this.connection.on('end', () => {
      this.log.verbose('Connection stream ended')
    })
    this.connection.on('error', (error) => {
      this.log.verbose('Connection stream error: ', error)
    })
    this.connection.on('readable', () => {
      this.log.verbose('Connection stream readable')
      this.connection.read()
    })
    this.connection.on('pause', () => {
      this.log.verbose('Connection stream paused')
    })
    this.connection.on('resume', () => {
      this.log.verbose('Connection stream resume')
    })
    this.connection.on('data', this.handle)

    this.log.verbose('Contract client connected')
  }

  handle = async (resp: ContractTransactionResponse) => {
    this.log.verbose('Handling tx')

    if (!resp.transaction) {
      throw new Error('Transaction not provided')
    }

    try {
      this.log.verbose('Sending task to worker pool', resp.transaction.id)
      await this.workerPool.execute(resp)
      this.log.verbose('Worker processed task', resp.transaction.id)
    } catch (e) {
      this.log.error('Worker execution error', e.message)
    }
  }
}
