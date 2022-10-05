import { TInt } from "../core/data-types/integer";

export type TValue = string | number | boolean | Buffer;

export type TVal = string | TInt | boolean | Buffer;

export type TAction = (...args: any) => void;
