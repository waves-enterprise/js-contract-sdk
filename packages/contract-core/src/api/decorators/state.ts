import { ExecutionContext } from '../../execution'
import { Constructable } from '../../intefaces/helpers'
import { getState } from './common'
import { Container } from '../container'


export function State(): PropertyDecorator
export function State(target: object, propertyKey: string): unknown
export function State(...args: any[]) {
  if (args.length > 1) {
    return decorateState(args[0], args[1])
  }

  return (target: Constructable<unknown>, propertyKey: string) => decorateState(target, propertyKey)
}

const decorateState = (target: Constructable<unknown>, propertyKey: string) => {
  Object.defineProperty(target, propertyKey, {
    get(): unknown {
      return getState()
    },
    set(_: unknown) {
      throw new Error('Contract state is initialized')
    },
  })
}

export function Ctx(): PropertyDecorator
export function Ctx(target: object, propertyKey: string): unknown
export function Ctx(...args: any[]) {
  if (args.length > 1) {
    return decorateContext(args[0], args[1])
  }

  return (target: Constructable<unknown>, propertyKey: string) => decorateContext(target, propertyKey)
}

const decorateContext = (target: Constructable<unknown>, propertyKey: string) => {
  Object.defineProperty(target, propertyKey, {
    get(): unknown {
      return Container.get(ExecutionContext)
    },
    set(_: unknown) {
      throw new Error('Context is initialized')
    },
  })
}
