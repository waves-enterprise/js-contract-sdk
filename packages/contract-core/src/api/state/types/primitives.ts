import BN from 'bn.js'
import Long from 'long'


export abstract class PrimitiveType<T = unknown> {
    private _internal: T

    settle(t: T) {
      this._internal = t
    }

    castToTargetType(prototype?: unknown) {
      if (BN.isBN(this._internal)) {
        return this._internal.toNumber()
      }

      return this._internal
    }


    abstract get(): Promise<unknown>

    abstract set(value: unknown)
}


export type TVar<T> = {
  get(): Promise<T>,

  set(value: T): void,
}


export type CastTrait = {
  settle(t: unknown): void,
}


export class TInt<T extends number | BN> implements TVar<T>, CastTrait {
    private _internal: T

    settle(t: T) {
      this._internal = t
    }

    get(): Promise<T> {
      return Promise.resolve(this._internal)
    }

    set(value: number | BN): void {
    }
}


type IntegerType = typeof BN | number | Long

// export type TInt<T extends IntegerType = number> = TVar<T>;