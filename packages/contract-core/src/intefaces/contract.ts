import {DataEntry} from "@waves-enterprise/js-contract-grpc-client/data_entry";

export type ResultStatus = 'success' | 'error';

export type ExecutionResult = {
    status: ResultStatus,
    entries: DataEntry[]
}