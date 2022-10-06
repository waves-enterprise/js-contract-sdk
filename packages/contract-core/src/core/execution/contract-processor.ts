import {
    ExecutionErrorRequest,
    ExecutionSuccessRequest
} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ExecutionContext} from "./execution-context";
import {RPC} from "../../grpc";
import {ContractActionMetadataExtractor} from "./extractors/action-extractor";
import {ContractActionArgumentsExtractor} from "./extractors/arguments-extractor";
import {IncomingTransactionResp} from "../types/core";
import {ERROR_CODE} from "../types/errors";
import {ServiceContainer} from "../common";

export class ContractProcessor {
    private actionExtractor = new ContractActionMetadataExtractor();
    private actionArgsExtractor = new ContractActionArgumentsExtractor();

    constructor(
        private contract: any,
        private rpc: RPC
    ) {
    }

    async handleIncomingTx(resp: IncomingTransactionResp): Promise<any> {
        const executionContext = new ExecutionContext(
            resp,
            this.rpc,
        );

        const actionMetadata = this.actionExtractor.extract(this.contract, executionContext);
        const actionArguments = this.actionArgsExtractor.extract(this.contract, executionContext, actionMetadata)

        ServiceContainer.set(executionContext);

        const c = this.contract;
        const contractInstance = new c();

        try {
            await contractInstance[actionMetadata.propertyName](...actionArguments)

            return this.tryCommitSuccess(executionContext)
        } catch (e) {

            return this.tryCommitError(executionContext, e)
        }
    }

    async tryCommitSuccess(executionContext: ExecutionContext) {
        try {
            await this.rpc.Contract.commitExecutionSuccess(ExecutionSuccessRequest.fromPartial({
                txId: executionContext.txId,
                results: executionContext.state.getStateEntries(),
                assetOperations: executionContext.assetOperations.operations
            }))
        } catch (e) {
            await this.rpc.Contract.commitExecutionError(ExecutionErrorRequest.fromPartial({
                txId: executionContext.txId,
                message: e.message || 'Unhandled error'
            }))
        }
    }

    tryCommitError(executionContext: ExecutionContext, e: any) {
        return this.rpc.Contract.commitExecutionError(ExecutionErrorRequest.fromPartial({
            txId: executionContext.txId,
            message: e.message || 'Unhandled error',
            code: e.code || ERROR_CODE.FATAL
        }))
    }
}