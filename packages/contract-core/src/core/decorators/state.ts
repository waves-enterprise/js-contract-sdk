import { ServiceContainer } from '../common/service-container'
import { ExecutionContext } from '../execution/execution-context'
import { Constructable } from '../../intefaces/helpers'
import { getState } from './common'


export function State(): PropertyDecorator
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function State(target: object, propertyKey: string): any
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
    set(_v: unknown) {
      throw new Error('Contract state is initialized')
    },
  })
}

export function Ctx(): PropertyDecorator
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Ctx(target: object, propertyKey: string): any
export function Ctx(...args: any[]) {
  if (args.length > 1) {
    return decorateContext(args[0], args[1])
  }

  return (target: Constructable<unknown>, propertyKey: string) => decorateContext(target, propertyKey)
}

const decorateContext = (target: Constructable<unknown>, propertyKey: string) => {
  Object.defineProperty(target, propertyKey, {
    get(): unknown {
      return ServiceContainer.get(ExecutionContext)
    },
    set(_v: unknown) {
      throw new Error('Context is initialized')
    },
  })
}
