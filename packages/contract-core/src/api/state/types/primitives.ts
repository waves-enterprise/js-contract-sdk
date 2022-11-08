import BN from 'bn.js'


export abstract class PrimitiveType<T = unknown> {
    private _internal: T

    settle(t: T) {
      this._internal = t
    }

    castToTargetType() {
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