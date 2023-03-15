import {Executor} from "./executor";
import {TVal} from "../intefaces/contract";


export type BaseContract = {
  getKey(key: string): TVal
}


export type OpenedContract<F> = BaseContract & {
  [P in keyof F]: P extends `${'invoke'}${string}`
    ? (F[P] extends (x: Executor, ...args: infer P) => infer R ? (...args: P) => R : never)
    : F[P];
}