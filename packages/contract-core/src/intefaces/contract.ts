import { TInt } from '../core/data-types/integer'

export type TValue = string | number | boolean | Uint8Array | undefined

export type TVal = string | TInt | boolean | Buffer

export type TAction = (...args: unknown[]) => void
