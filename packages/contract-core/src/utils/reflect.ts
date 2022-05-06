import { Constructable } from '../intefaces/helpers';
import { TArgs } from '../core/decorators/param';
import { ACTION_METADATA, ARGS_METADATA } from '../core/consts';
import { TContractActionsMetadata } from '../core/decorators/action';

export function getArgsMetadata(contract: Constructable<any>, property: string): TArgs {
    return Reflect.getMetadata(ARGS_METADATA, contract, property) || {};
}

export function getContractMetadata(contract: Constructable<any>): TContractActionsMetadata {
    return Reflect.getMetadata(ACTION_METADATA, contract);
}
