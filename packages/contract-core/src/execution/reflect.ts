import { ACTION_METADATA, ARGS_METADATA } from "./constants";
import { TArgs, TContractActionsMetadata } from "../api/meta";
import { Constructable } from "../@types/common";

export function getArgsMetadata(contract: Constructable<any>, property: string): TArgs {
    return Reflect.getMetadata(ARGS_METADATA, contract, property) || {};
}

export function getContractMetadata(contract: Constructable<any>): TContractActionsMetadata {
    return Reflect.getMetadata(ACTION_METADATA, contract);
}
