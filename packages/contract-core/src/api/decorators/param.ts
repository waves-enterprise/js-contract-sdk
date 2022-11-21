import { ALL_PARAMS_KEY, ARGS_METADATA } from '../contants'
import { TArgs } from '../meta'
import { getExecutionContext, getPayments, getTx } from './common'

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

export function Params() {
  return createParamsDecorator(ALL_PARAMS_KEY)
}

export function Payments(target: object, propertyKey: string | symbol, parameterIndex: number): void {
  const args: TArgs = Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {}
  Reflect.defineMetadata(
    ARGS_METADATA,
    assignMetadata(args, parameterIndex, getPayments),
    target.constructor,
    propertyKey,
  )
}


export function Ctx(target: object, propertyKey: string | symbol, parameterIndex: number): void {
  const args: TArgs = Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {}
  Reflect.defineMetadata(
    ARGS_METADATA,
    assignMetadata(args, parameterIndex, getExecutionContext),
    target.constructor,
    propertyKey,
  )
}

export function Tx(target: object, propertyKey: string | symbol, parameterIndex: number): void {
  const args: TArgs = Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {}
  Reflect.defineMetadata(
    ARGS_METADATA,
    assignMetadata(args, parameterIndex, getTx),
    target.constructor,
    propertyKey,
  )
}
