import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";

export interface Tx {
    params: DataEntry[]
}