import {IStateReader} from "./interfaces";
import {logger} from "../logger";
import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";
import {ContractClient} from "../../rpc/clients/contract-client";
import {ReadContractStateException} from "../exceptions";

export class StateReader implements IStateReader {
    log = logger(this);

    constructor(
        private readonly contractId: string,
        private readonly client: ContractClient,
    ) {
    }

    async readOne(key: string): Promise<DataEntry | undefined> {
        try {
            const resp = await this.client.getContractKey({
                contractId: this.contractId,
                key
            })

            return resp.entry;
        } catch (e) {
            throw new ReadContractStateException
        }
    }
}