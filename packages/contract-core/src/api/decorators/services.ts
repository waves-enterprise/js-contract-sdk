import { Constructable } from '../../intefaces/helpers'
import { AssetsService } from '../assets/assets-service'
import { getExecutionContext } from './common'

export function Assets() {
  return (...args: any[]) => decorateService.call(undefined, ...args) as void
}

export function decorateService(target: Constructable<unknown>, propertyKey: string, _): void {
  const designType = Reflect.getMetadata('design:type', target, propertyKey)

  Object.defineProperty(target, propertyKey, {
    set: () => {
      throw new Error('cannot reassign typed property')
    },
    get: () => {
      switch (designType) {
        case AssetsService: {
          return new AssetsService(getExecutionContext())
        }
        default:
          throw Error('Unknown service')
      }
    },
  })
}
