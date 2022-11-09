import 'reflect-metadata'
import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { ContractProcessor } from './contract-processor'
import { envConfig, RPC } from '../grpc'
import { ProcessTransactionTask } from './types'

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
    try {
      await processor.handleIncomingTx(incoming)
    } catch (e) {
      /* eslint-disable no-console */
      console.log('Uncathed error', e, 'tx may not be committed')
      /* eslint-enable no-console */
    } finally {
      this.messagePort.postMessage('done')
    }
  })
})()
