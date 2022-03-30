import {GRPCClient} from "../../grpc/client";
import {Context} from "../context";
import {ServiceContainer} from "../service-container";
import {ContractHandler, IHandler} from "../handlers/contract-handler";
import {ParamsMapper} from "../mappers/params-mapper";
import {ContractState} from "../state/contract-state";

export class ContractProcessor {
    private paramsProcessor: ParamsMapper;

    public static getContractHandler(_ctx: Context): IHandler {
        return new ContractHandler();
    }

    constructor(
        private rpcClient: GRPCClient
    ) {
        this.paramsProcessor = new ParamsMapper();
    }

    process(ctx: Context) {
        const state = new ContractState(this.rpcClient, ctx);
        const contractHandler = ContractProcessor.getContractHandler(ctx);

        ServiceContainer.set(ctx);
        ServiceContainer.set(state);

        const executionResult = contractHandler.handle(ctx, state);

        if (executionResult.status === 'success') {
            this.rpcClient.contractService.commitExecutionSuccess({
                    txId: ctx.transaction.id,
                    results: executionResult.entries
                },
                ctx.auth.metadata(),
                console.log
            )
        } else {
            this.rpcClient.contractService.commitExecutionError({
                    txId: ctx.transaction.id,
                    code: 0,
                    message: 'Errored execution'
                },
                ctx.auth.metadata(),
                console.log
            )
        }
    }
}
