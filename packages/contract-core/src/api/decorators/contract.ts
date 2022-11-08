import { CONTRACT_PRELOADED_ENTRIES } from '../contants'

type ContractOptions = {
  component: string,
}

export function Contract(_: ContractOptions = { component: 'default' }): ClassDecorator {
  return (target: unknown) => {

    Reflect.defineMetadata(CONTRACT_PRELOADED_ENTRIES, new Map(), target as unknown as object)
  }
}
