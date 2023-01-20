import 'reflect-metadata'
import { isMainThread, parentPort, workerData } from 'node:worker_threads'
import { ContractProcessor } from './contract-processor'
import { CommonLogger, Logger } from '../api'
import { GrpcClient } from '../grpc/grpc-client'
import { CONNECTION_TOKEN, NODE_ADDRESS } from '../grpc/config'
import { ContractTransaction, ContractTransactionResponse, CurrentBlockInfo } from '@wavesenterprise/we-node-grpc-api'
import {
  ContractTransaction as RawContractTransaction,
  BlockInfo as RawBlockInfo,
} from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service'

Logger.workerIdx = workerData.index

if (isMainThread) {
  throw new Error('Main thread error')
}

(async function () {
  if (parentPort === null) {
    throw new Error('parent port not found')
  }
  const ContractClassConstructor = await import(workerData.contractPath)
    .then(({ default: ContractClass }) => ContractClass as unknown)

  const grpcClient = new GrpcClient({
    nodeAddress: NODE_ADDRESS,
    connectionToken: CONNECTION_TOKEN,
  })

  const processor = new ContractProcessor(ContractClassConstructor, grpcClient)

  parentPort.on('message', async (incoming: ContractTransactionResponse) => {
    const start = Date.now()
    const { authToken, transaction: serializedTx, currentBlockInfo: serializedBlockInfo } = incoming
    const transaction = RawContractTransaction.fromJSON(serializedTx) as ContractTransaction
    const currentBlockInfo = RawBlockInfo.fromJSON(serializedBlockInfo) as CurrentBlockInfo
    const txId = transaction.id
    CommonLogger.verbose(`Worker received tx ${txId}`)
    try {
      await processor.handleIncomingTx({
        authToken,
        transaction,
        currentBlockInfo,
      })
      CommonLogger.info(`Worker handled tx ${txId} in ${Date.now() - start}ms`)
    } catch (e) {
      CommonLogger.error(
        `Uncaught error "${e.message}" tx ${transaction?.id} may not be committed`,
        e.stack,
      )
    } finally {
      parentPort!.postMessage('done')
    }
  })
})()
