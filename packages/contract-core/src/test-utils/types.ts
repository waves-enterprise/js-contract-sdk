import { TVal } from '../intefaces/contract'
import { Executor } from './executor'
import { Keypair } from '@wavesenterprise/signer'

export type SandboxContract = {
  address: string,
  targetExecutable: ContractExecutable,
}

export type ContractExecutable = any
export type Account = string

export type Invokable<F> = {
  [P in keyof F]: P extends `${'invoke'}${string}`
    ? (F[P] extends (x: Executor, ...args: infer Arguments) => infer R ? (...args: Arguments) => R : never)
    : F[P];
}

export type BaseMethods<F> = {
  getKey(key: string): TVal,
  as(t: Keypair): OpenedContract<F>,
}

export type BaseMethodName = keyof BaseMethods<any>
export type OpenedContract<F> = BaseMethods<F> & Invokable<F>
