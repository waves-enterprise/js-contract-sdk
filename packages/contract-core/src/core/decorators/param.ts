import { ARGS_METADATA } from '../consts'

export type TArgs = {
  [key: string]: {
    index: number,
    paramKey: string,
  },
}

function assignMetadata(args: TArgs, index: number, paramKey: string): TArgs {
  return {
    ...args,
    [`arg:${index}`]: {
      index,
      paramKey,
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
