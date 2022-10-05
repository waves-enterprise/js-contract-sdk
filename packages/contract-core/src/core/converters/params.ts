import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";
import {TVal} from "../../intefaces/contract";
import {_parseDataEntry} from "../../utils";
import {TParam} from "../types/core";

export class Param implements TParam {
    constructor(
        public key: string,
        public value: TVal
    ) {
    }

    public get type(): "string" | 'integer' | 'binary' | 'boolean' {
        // TODO based on value type
        return 'string'
    }
}

export class Params {
    static parse = (dataEntry: DataEntry): TParam => {
        return new Param(dataEntry.key, _parseDataEntry(dataEntry))
    }
}