import 'reflect-metadata'
import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { ContractProcessor } from './contract-processor'
import { envConfig, RPC } from '../grpc'
import { IncomingTx, ProcessTransactionTask } from './types'
import { CommonLogger } from '../api'

if (isMainThread) {
  throw new Error('Main thread error')
}

(async function () {
  if (parentPort === null) {
    throw new Error('parent port not found')
  }
  const ContractClassConstructor = await import(workerData.contractPath)
    .then(({ default: ContractClass }) => ContractClass as unknown)

  const rpc = new RPC(envConfig())
  rpc.Contract.connect()

  const processor = new ContractProcessor(ContractClassConstructor, rpc)

  parentPort!.on('message', async (incoming: ProcessTransactionTask) => {
    const start = Date.now()
    const idx = workerData.index
    const txId = (incoming.tx as IncomingTx).id
    CommonLogger.verbose(`Worker#${idx} received tx ${txId}`)
    try {
      await processor.handleIncomingTx(incoming)
      CommonLogger.info(`Worker#${idx} handled tx ${txId} in ${Date.now() - start}ms`)
    } catch (e) {
      CommonLogger.error(`Uncaught error ${e.message} tx may not be committed`)
    } finally {
      parentPort!.postMessage('done')
    }
  })
})()
