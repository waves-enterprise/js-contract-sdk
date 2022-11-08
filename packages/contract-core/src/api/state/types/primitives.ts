import BN from 'bn.js'
import Long from "long";


export abstract class PrimitiveType<T = any> {
    private _internal: T;

    public settle(t: T) {
        this._internal = t;
    }

    castToTargetType(prototype?: any) {
        if (BN.isBN(this._internal)) {
            return this._internal.toNumber();
        }

        return this._internal;
    }


    abstract get(): Promise<any>

    abstract set(value: any)
}


export type TVar<T> = {
    get(): Promise<T>

    set(value: T): void
}


export interface CastTrait {
    settle(t: any): void
}


export class TInt<T extends number | BN> implements TVar<T>, CastTrait {
    private _internal: T;

    public settle(t: T) {
        this._internal = t;
    }

    get(): Promise<T> {
        return Promise.resolve(this._internal);
    }

    set(value: number | BN): void {
    }
}


type IntegerType = typeof BN | number | Long

// export type TInt<T extends IntegerType = number> = TVar<T>;