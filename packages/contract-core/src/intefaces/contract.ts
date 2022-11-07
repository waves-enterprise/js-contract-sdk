import { TInt } from "../api";

export type TValue = string | number | boolean | Uint8Array;

export type TVal = string | TInt | boolean | Buffer;

export type TAction = (...args: any) => void;
