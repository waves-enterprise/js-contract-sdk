import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";
import {TValue} from "../../intefaces/contract";

export interface IStateReader {
    readOne(key: string): Promise<DataEntry>;
}


export interface IStateWriter<K = string, R = any> {
    write(key: string, value: TValue): void;

    getEntries(): DataEntry[];
}
