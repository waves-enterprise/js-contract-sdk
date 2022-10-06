/* eslint-disable no-redeclare */
import { ContractRegistry } from '../contract-registry'
import { Constructable } from '../../intefaces/helpers'

type ContractOptions = {
  component: string,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Contract(): any
export function Contract<T = unknown>(options: ContractOptions): T | void
export function Contract(options: ContractOptions = { component: 'default' }): ClassDecorator {
  return (targetConstructor) => {
    if (options.component === 'default') {
      ContractRegistry.add(options.component, targetConstructor as unknown as Constructable<unknown>)
    }

    // TODO multiple contracts implementations
  }
}
