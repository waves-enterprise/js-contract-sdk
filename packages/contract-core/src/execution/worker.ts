import "reflect-metadata";
import { isMainThread, parentPort, workerData } from "node:worker_threads";
import { ContractProcessor } from "./contract-processor";
import { envConfig, RPC } from "../grpc";
import { IncomingTransactionResp } from "./types";

if (isMainThread) {
    throw new Error("Main thread error");
}

(async function () {
    if (parentPort === null) {
        throw new Error("parent port not found");
    }

    const ContractClass = await import(workerData.contractPath).then(({ default: ContractClass }) => ContractClass);

    const rpc = new RPC(envConfig());
    rpc.Contract.connect();

    const processor = new ContractProcessor(ContractClass, rpc);

    parentPort!.on("message", async (incoming: IncomingTransactionResp) => {
        try {
            await processor.handleIncomingTx(incoming);
        } catch (e) {
            console.log("Uncathed error", e, "tx may not be committed");
        } finally {
            this.messagePort.postMessage("done");
        }
    });
})();
