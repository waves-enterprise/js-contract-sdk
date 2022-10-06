import { Constructable } from '../../intefaces/helpers'
import { getState } from './common'
import { ContractError } from '../exceptions'
import { TValue } from '../../intefaces/contract'

export type TVarConfig = {
  name?: string,
  mutable?: boolean,
  eager?: boolean,
}


const DefaultConfig: TVarConfig = {
  mutable: true,
  eager: false,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Var(target: object, propertyName: string | symbol, descriptor): any
export function Var(): PropertyDecorator
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Var(props: TVarConfig): any
export function Var(...args: any[]) {
  if (args.length > 1) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return decorateProperty.call(this, ...args, DefaultConfig)
  }

  const config = args[0] || {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (...args_: any[]) => decorateProperty.call(this, ...args_, { ...DefaultConfig, ...config })
}

export function decorateProperty(target: Constructable<unknown>, propertyKey: string, _, config: TVarConfig) {
  const contractKey = config.name || propertyKey

  Object.defineProperty(target, propertyKey, {
    set: () => {
      throw new Error('cannot reassign typed property')
    },
    get: () => {
      return {
        get() {
          return getState().tryGet(contractKey)
        },
        set(value: TValue) {

          if (!config.mutable) {
            throw new ContractError(`Trying to set immutable variable "${contractKey}" in call transaction `)
          }

          getState().set(contractKey, value)
        },
      }
    },
  })
}