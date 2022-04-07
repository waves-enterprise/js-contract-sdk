import {DataEntry} from "@waves-enterprise/js-contract-grpc-client/data_entry";

export const isUndefined = (v: any) => {
    return v === undefined;
}

export const isString = (v: any) => {
    return typeof v === 'string';
}

export const isBool = (v: any) => {
    return typeof v === 'boolean';
}

export const isNum = (v: any) => {
    return typeof v === 'number';
}


export function getValueStateKey(v: any): keyof Omit<DataEntry, 'key'> {
    if (isBool(v)) {
        return 'boolValue';
    }

    if (isNum(v)) {
        return 'intValue'
    }

    return 'stringValue'
}