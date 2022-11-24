import { Constructable } from '../../intefaces/helpers'
import { getState } from './common'
import { ContractError } from '../../execution'
import { CONTRACT_VARS } from '../contants'
import { TContractVarsMeta } from '../meta'
import { TValue } from '../../intefaces/contract'
import { ContractMapping } from '../state'
import { ContractValue } from '../state/types/value'

export type TVarConfig = {
  key: string,
  mutable?: boolean,
  serialize?: (value: unknown) => TValue,
  deserialize?: (value: TValue) => unknown,
}

export function Var(target: object, propertyName: string | symbol, descriptor): void
export function Var(props?: TVarConfig): PropertyDecorator
export function Var(...args: any[]) {
  if (args.length > 1) {
    decorateProperty.call(undefined, ...args, {
      key: args[1],
    })
    return
  }

  return (...args_: any[]): void => decorateProperty.call(undefined, ...args_, {
    key: args_[1],
    ...args[0],
  }) as void
}

export function JsonVar(target: object, propertyName: string | symbol, descriptor): void
export function JsonVar(props?: TVarConfig): PropertyDecorator
export function JsonVar(...args: any[]) {
  if (args.length > 1) {
    decorateProperty.call(undefined, ...args, {
      key: args[1],
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    })
    return
  }

  return (...args_: any[]): void => decorateProperty.call(undefined, ...args_, {
    key: args_[1],
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    ...args[0],
  }) as void
}

export function decorateProperty(target: Constructable<unknown>, propertyKey: string, _, config: TVarConfig): void {
  const contractKey = config.key

  const meta: TContractVarsMeta = Reflect.getMetadata(CONTRACT_VARS, target.constructor) || {}
  const designType = Reflect.getMetadata('design:type', target, propertyKey)
  const isMapping = designType === ContractMapping

  if (!!meta[contractKey]) {
    throw new ContractError('Variable names need to be unique')
  }

  meta[contractKey] = {
    propertyKey,
    meta: config,
  }

  Reflect.defineMetadata(
    CONTRACT_VARS,
    meta,
    target.constructor,
  )

  Object.defineProperty(target, propertyKey, {
    set: () => {
      throw new Error('cannot reassign typed property')
    },
    get: () => {
      if (isMapping) {
        return new ContractMapping(getState(), config)
      }
      return new ContractValue(getState(), config)
    },
  })
}
