import {RpcStateReader} from "./rpc-state-reader";
import {StateWriter} from "./state-writer";
import {GRPCClient} from "../../grpc/client";
import {Context} from "../context";
import {DataEntry} from "@waves-enterprise/js-contract-grpc-client/data_entry";

export class ContractState {
    private stateReader: RpcStateReader;
    private stateWriter: StateWriter;

    constructor(
        private grpcClient: GRPCClient,
        private ctx: Context
    ) {

        this.stateReader = new RpcStateReader(
            ctx.contractId,
            grpcClient,
            ctx.auth.metadata()
        )
        this.stateWriter = new StateWriter();
    }

    get(key: string): Promise<{ entry: DataEntry }> {
        return this.stateReader.readOne(key)
    }

    set(key: string, value: any) {
        this.stateWriter.write(key, value);
    }

    getStateEntries(): DataEntry[] {
        return this.stateWriter.getDataEntries();
    }
}


