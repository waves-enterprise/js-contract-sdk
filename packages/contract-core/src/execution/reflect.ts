import { ACTION_METADATA, ARGS_METADATA } from './constants'
import { TArgs, TContractActionsMetadata, TContractVarsMeta } from '../api/meta'
import { Constructable } from '../@types/common'
import { CONTRACT_PRELOADED_ENTRIES, CONTRACT_VARS } from '../api/contants'
import { TVal } from '../intefaces/contract'

export function getArgsMetadata(contract: Constructable<unknown>, property: string): TArgs {
  return Reflect.getMetadata(ARGS_METADATA, contract, property) || {}
}

export function getContractMetadata(contract: Constructable<unknown>): TContractActionsMetadata {
  return Reflect.getMetadata(ACTION_METADATA, contract)
}

export function getContractVarsMetadata(contract: Constructable<unknown>): TContractVarsMeta {
  return Reflect.getMetadata(CONTRACT_VARS, contract)
}


export function setContractEntry(contract: unknown, key: string, value: TVal): void {
  const entries = getContractEntries(contract)

  entries.set(key, value)

  return Reflect.defineMetadata(CONTRACT_PRELOADED_ENTRIES, entries, contract)
}

export function setContractEntries(contract: unknown, keys: Map<string, TVal>): void {
  return Reflect.defineMetadata(CONTRACT_PRELOADED_ENTRIES, keys, contract.constructor)
}

export function getContractEntries(contract: unknown): Map<string, TVal> {
  return Reflect.getMetadata(CONTRACT_PRELOADED_ENTRIES, contract.constructor)
}


