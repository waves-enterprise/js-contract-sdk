import * as os from "os";
import { DataEntry } from "@wavesenterprise/js-contract-grpc-client/data_entry";
import { TVal, TValue } from "../intefaces/contract";
import Long from "long";
import { TInt } from "../api";

export const isUndefined = (v: any): v is undefined => {
    return v === undefined;
};

export const isString = (v: any): v is string => {
    return typeof v === "string";
};

export const isBool = (v: any): v is boolean => {
    return typeof v === "boolean";
};

export const isNum = (v: any): v is number => {
    return typeof v === "number";
};

export function nil() {
    return undefined;
}

export function getValueStateKey(v: any): keyof Omit<DataEntry, "key"> {
    if (isBool(v)) {
        return "boolValue";
    }

    if (isNum(v)) {
        return "intValue";
    }

    if (v instanceof Uint8Array) {
        return "binaryValue";
    }

    return "stringValue";
}

export function _parseDataEntry(d: DataEntry): TVal {
    if (!isUndefined(d.stringValue)) {
        return d.stringValue;
    }

    if (!isUndefined(d.intValue)) {
        return new TInt(d.intValue.toNumber());
    }

    if (!isUndefined(d.boolValue)) {
        return d.boolValue;
    }

    if (!isUndefined(d.binaryValue)) {
        return Buffer.from(d.binaryValue);
    }

    throw new Error("Data entry parse error");
}

export function parseDataEntry(d: DataEntry): TValue {
    if (!isUndefined(d.stringValue)) {
        return d.stringValue;
    }

    if (!isUndefined(d.intValue)) {
        return Long.fromValue(d.intValue).toNumber();
    }

    if (!isUndefined(d.boolValue)) {
        return d.boolValue;
    }

    if (!isUndefined(d.binaryValue)) {
        return Buffer.from(d.binaryValue);
    }

    throw new Error("Data entry parse error");
}

export function isPrimitive(v: any) {
    return (
        v.prototype === String.prototype ||
        v.prototype === Number.prototype ||
        v.prototype === Boolean.prototype ||
        v.prototype === Buffer.prototype
    );
}

export function isWrappedType(v: any) {
    return v.prototype === TInt.prototype;
}

export const getCpusCount = () => os.cpus().length;
