import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";

export const isUndefined = (v: any) => {
    return v === undefined;
}

export const isString = (v: any): v is string => {
    return typeof v === 'string';
}

export const isBool = (v: any): v is boolean => {
    return typeof v === 'boolean';
}

export const isNum = (v: any): v is number => {
    return typeof v === 'number';
}

export function getValueStateKey(v: any): keyof Omit<DataEntry, 'key'> {
    if (isBool(v)) {
        return 'boolValue';
    }

    if (isNum(v)) {
        return 'intValue'
    }

    if (Buffer.isBuffer(v)) {
        return 'binaryValue'
    }

    return 'stringValue'
}

export function parseDataEntry(d: DataEntry): string | number | boolean | Buffer | undefined {
    if (!isUndefined(d.stringValue)) {
        return d.stringValue
    }

    if (!isUndefined(d.intValue)) {
        return d.intValue
    }

    if (!isUndefined(d.boolValue)) {
        return d.boolValue
    }

    if (!isUndefined(d.binaryValue)) {
        return Buffer.from(d.binaryValue);
    }
}