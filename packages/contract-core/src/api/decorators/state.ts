import { Constructable } from '../../intefaces/helpers'
import { getState } from './common'


export function State(): PropertyDecorator
export function State(target: object, propertyKey: string): void
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
