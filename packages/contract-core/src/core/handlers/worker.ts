import 'reflect-metadata'
import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { ContractProcessor } from '../execution/contract-processor'
import { envConfig, RPC } from '../../grpc'
import { IncomingTransactionResp } from '../types/core'

if (isMainThread) {
  throw new Error('Main thread error')
}

(async function () {
  if (parentPort === null) {
    throw new Error('parent port not found')
  }

  const ContractClass = await import(workerData.contractPath)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .then(({ default: contractClass }) => contractClass)

  const rpc = new RPC(envConfig())
  rpc.Contract.connect()

  const processor = new ContractProcessor(ContractClass, rpc)

  parentPort!.on('message', async (incoming: IncomingTransactionResp) => {
    try {
      await processor.handleIncomingTx(incoming)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Uncathed error', e, 'tx may not be committed')
    } finally {
      this.messagePort.postMessage('done')
    }
  })
})()