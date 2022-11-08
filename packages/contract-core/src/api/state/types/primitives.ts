import BN from 'bn.js'
import Long from "long";

export type TVar<T> = {
    get(): Promise<T>

    set(value: T): void
}

type IntegerType = typeof BN | number | Long

export type TInt<T extends IntegerType = number> = TVar<T>;