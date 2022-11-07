import {
    ExecutionErrorRequest,
    ExecutionSuccessRequest,
} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import { ExecutionContext } from "./execution-context";
import { RPC } from "../grpc";
import { IncomingTransactionResp } from "./types";
import { ERROR_CODE } from "./constants";
import { Container } from "../api";
import { ParamsExtractor } from "./params-extractor";

export class ContractProcessor {
    private paramsExtractor = new ParamsExtractor();

    constructor(private contract: any, private rpc: RPC) {}

    async handleIncomingTx(resp: IncomingTransactionResp): Promise<any> {
        const executionContext = new ExecutionContext(resp, this.rpc);

        const { args, actionMetadata } = this.paramsExtractor.extract(this.contract, executionContext);

        Container.set(executionContext);

        const c = this.contract;
        const contractInstance = new c();

        try {
            await contractInstance[actionMetadata.propertyName](...args);

            return this.tryCommitSuccess(executionContext);
        } catch (e) {
            return this.tryCommitError(executionContext, e);
        }
    }

    async tryCommitSuccess(executionContext: ExecutionContext) {
        try {
            await this.rpc.Contract.commitExecutionSuccess(
                ExecutionSuccessRequest.fromPartial({
                    txId: executionContext.txId,
                    results: executionContext.state.getStateEntries(),
                    assetOperations: executionContext.assetOperations.operations,
                }),
            );
        } catch (e) {
            await this.rpc.Contract.commitExecutionError(
                ExecutionErrorRequest.fromPartial({
                    txId: executionContext.txId,
                    message: e.message || "Unhandled error",
                }),
            );
        }
    }

    tryCommitError(executionContext: ExecutionContext, e: any) {
        return this.rpc.Contract.commitExecutionError(
            ExecutionErrorRequest.fromPartial({
                txId: executionContext.txId,
                message: e.message || "Unhandled error",
                code: e.code || ERROR_CODE.FATAL,
            }),
        );
    }
}
