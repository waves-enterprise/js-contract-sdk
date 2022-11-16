import { ARGS_METADATA } from '../contants'
import { TArgs } from '../meta'
import { getExecutionContext } from './common'

function assignMetadata(args: TArgs, index: number, paramKeyOrGetter: string | (() => void)): TArgs {
  const key = `arg:${index}`

  return {
    ...args,
    [key]:
      typeof paramKeyOrGetter === 'string'
        ? {
          index,
          paramKey: paramKeyOrGetter,
        }
        : {
          index,
          getter: paramKeyOrGetter,
        },
  }
}

const createParamsDecorator =
  (paramKey: string): ParameterDecorator =>
    (target, propertyKey, parameterIndex) => {
      const args: TArgs = Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {}

      Reflect.defineMetadata(
        ARGS_METADATA,
        assignMetadata(args, parameterIndex, paramKey),
        target.constructor,
        propertyKey,
      )
    }

export function Param(paramName: string) {
  return createParamsDecorator(paramName)
}

export function Payments(target: object, propertyKey: string | symbol, parameterIndex: number): void {
  const args: TArgs = Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {}
  Reflect.defineMetadata(
    ARGS_METADATA,
    assignMetadata(args, parameterIndex, () => getExecutionContext().tx.payments),
    target.constructor,
    propertyKey,
  )
}


export function Ctx(target: object, propertyKey: string | symbol, parameterIndex: number): void {
  const args: TArgs = Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {}
  Reflect.defineMetadata(
    ARGS_METADATA,
    assignMetadata(args, parameterIndex, () => getExecutionContext()),
    target.constructor,
    propertyKey,
  )
}
