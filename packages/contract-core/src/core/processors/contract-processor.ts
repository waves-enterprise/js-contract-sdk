import {GRPCClient} from "../../grpc/client";
import {Context} from "../context";
import {ServiceContainer} from "../service-container";
import {ContractHandler, IHandler} from "../handlers/contract-handler";
import {ParamsMapper} from "../mappers/params-mapper";
import {ContractState} from "../state/contract-state";
import {logger} from "../logger";
import {ExecutionResult} from "../../intefaces/contract";
import {CommitExecutionException} from "../exceptions";
import {CommitExecutionResponse} from "@waves-enterprise/js-contract-grpc-client/contract/contract_contract_service";

export class ContractProcessor {
    log = logger(this);

    private paramsProcessor: ParamsMapper;

    public static getContractHandler(_ctx: Context): IHandler {
        return new ContractHandler();
    }

    constructor(
        private rpcClient: GRPCClient
    ) {
        this.paramsProcessor = new ParamsMapper();
    }

    async process(ctx: Context) {
        const state = new ContractState(this.rpcClient, ctx);
        const contractHandler = ContractProcessor.getContractHandler(ctx);

        ServiceContainer.set(ctx);
        ServiceContainer.set(state);

        const executionResult = await contractHandler.handle(ctx, state);

        await this.commitExecutionResult(executionResult, ctx)
    }

    commitExecutionResult(executionResult: ExecutionResult, ctx: Context) {
        return new Promise((resolve, reject) => {
            if (executionResult.status === 'success') {
                this.rpcClient.contractService.commitExecutionSuccess({
                        txId: ctx.transaction.id,
                        results: executionResult.entries
                    },
                    ctx.auth.metadata(),
                    this.commitHandle(resolve, reject)
                );
            } else if (executionResult.status === 'error') {
                this.rpcClient.contractService.commitExecutionError({
                        txId: ctx.transaction.id,
                        code: 0,
                        message: 'Errored execution'
                    },
                    ctx.auth.metadata(),
                    this.commitHandle(resolve, reject)
                )
            }
        });

    }

    commitHandle = (resolve, reject) => (error: Error, response: CommitExecutionResponse) => {
        if (error) {
            const {metadata} = error as any
            const {internalRepr} = metadata
            const internalReprKeysAndValues = []
            for (const [key, value] of internalRepr.entries()) {
                internalReprKeysAndValues.push(`${key}: ${value}`)
            }

            reject(new CommitExecutionException(`[Grpc Node Error] ${internalReprKeysAndValues.join(', ')}`));

            return;
        }

        resolve(response);
    }
}
