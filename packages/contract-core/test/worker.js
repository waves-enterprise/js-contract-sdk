require("reflect-metadata");

const {isMainThread, parentPort,workerData} = require("node:worker_threads");
const {ContractTransaction} = require("@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service");
const {ContractProcessor} = require("../dist/execution/contract-processor");
const {envConfig, RPC} = require("../dist/grpc");
const {Contract, Action, Var} = require("../dist");
const {convertContractTransaction} = require("../dist/execution/converter");

if (isMainThread) {
    throw new Error('Main thread error')
}


class ContractExample {
    test() {
        this.test.set('test')
    }
}


parentPort.on('message', async (incoming) => {
    if (parentPort === null) {
        throw new Error('parent port not found')
    }


    const ContractClassConstructor = await import(workerData.contractPath)
        .then(({ default: ContractClass }) => ContractClass)


    const cp = new ContractProcessor(ContractClassConstructor.default, new RPC(envConfig()))

    await cp.handleIncomingTx(incoming)
})



