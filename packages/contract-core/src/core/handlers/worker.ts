import 'reflect-metadata'
import {isMainThread, parentPort, workerData} from 'node:worker_threads';
import {WorkerHandler} from './worker-handler';

if (isMainThread) {
    throw new Error('Main thread error')
}

(async function () {
    if (parentPort === null) {
        throw new Error('parent port not found')
    }

    const ContractClass = await import(workerData.contractPath)
        .then(({default: ContractClass}) => ContractClass)

    const handler = new WorkerHandler(parentPort as unknown as MessagePort, ContractClass);

    parentPort!.on('message', handler.handle)
})();