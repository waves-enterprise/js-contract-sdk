import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";

export type ResultStatus = 'success' | 'error';


export type TValue = string | number | boolean | Buffer | undefined


export type ExecutionResult = {
    status: ResultStatus,
    entries: DataEntry[]
}