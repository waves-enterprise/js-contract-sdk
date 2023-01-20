import { ALL_PARAMS_KEY, ARGS_METADATA } from '../contants'
import { TArgs } from '../meta'
import { getBlock, getExecutionContext, getPayments, getSender, getTime, getTx } from './common'

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
  (paramKeyOrGetter: string | (() => void)): ParameterDecorator =>
    (target, propertyKey, parameterIndex) => {
      const args: TArgs = Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {}
      Reflect.defineMetadata(
        ARGS_METADATA,
        assignMetadata(args, parameterIndex, paramKeyOrGetter),
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

export function Payments() {
  return createParamsDecorator(getPayments)
}

export function Ctx() {
  return createParamsDecorator(getExecutionContext)
}

export function Tx() {
  return createParamsDecorator(getTx)
}

export function Sender() {
  return createParamsDecorator(getSender)
}

export function Block() {
  return createParamsDecorator(getBlock)
}

export function Time() {
  return createParamsDecorator(getTime)
}
