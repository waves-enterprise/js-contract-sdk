import { Constructable } from '../../intefaces/helpers'
import { getState } from './common'
import { ContractError } from '../../execution'
import { CONTRACT_VARS } from '../contants'
import { TContractVarsMeta, TVarMeta } from '../meta'
import { getContractEntries, setContractEntry } from '../../execution/reflect'
import { PrimitiveType } from '../state/types/primitives'
import { TVal } from '../../intefaces/contract'
import { Mapping } from '../state'

export type TVarConfig = Partial<TVarMeta>

const DefaultConfig: TVarConfig = {
  mutable: true,
  eager: false,
}


export function Var(target: object, propertyName: string | symbol, descriptor): void
export function Var(props?: TVarConfig): PropertyDecorator
export function Var(...args: any[]) {
  if (args.length > 1) {
    return decorateProperty.call(undefined, ...args, DefaultConfig) as void
  }

  const config = {
    ...DefaultConfig,
    ...(args[0] || {}),
  }

  return (...args_: any[]): void => decorateProperty.call(undefined, ...args_, config) as void
}

export function decorateProperty(target: Constructable<unknown>, propertyKey: string, _, config: TVarConfig): void {
  const contractKey = config.name || propertyKey

  const meta: TContractVarsMeta = Reflect.getMetadata(CONTRACT_VARS, target.constructor) || {}
  const designType = Reflect.getMetadata('design:type', target, propertyKey)
  const isMapping = designType === Mapping

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

  let _settled: object

  Object.defineProperty(target, propertyKey, {
    set: () => {
      throw new Error('cannot reassign typed property')
    },
    get: () => {
      if (!_settled) {
        if (isMapping) {
          const mappingInstance = getState().getMapping(contractKey)

          _settled = mappingInstance

          return _settled
        }

        const res = new class extends PrimitiveType {
          async get() {
            const entries = getContractEntries(target)

            let res
            if (entries.has(contractKey)) {
              res = entries.get(contractKey)
            } else {
              res = await getState().tryGet(contractKey)
            }

            this.settle(res)

            return this.castToTargetType()
          }

          set(value: TVal) {
            if (!config.mutable) {
              throw new ContractError(`Trying to set immutable variable "${contractKey}" in call transaction `)
            }

            setContractEntry(target, contractKey, value as TVal)
            getState().set(contractKey, value as TVal)
          }
        }()

        _settled = res
      }

      return _settled
    },
  })
}