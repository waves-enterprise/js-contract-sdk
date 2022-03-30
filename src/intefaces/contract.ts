import {DataEntry} from "@waves-enterprise/js-contract-grpc-client/data_entry";

export type ExecutionResult = {
    status: 'success' | 'error',
    entries: DataEntry[]
}