import {DataEntry} from "@waves-enterprise/js-contract-grpc-client/data_entry";

export interface Tx {
    params: DataEntry[]
}