import BN from "bn.js";

export type TValue = string | number | boolean | Uint8Array;

export type TVal = string | BN | boolean | Buffer;

export type TAction = (...args: any) => void;
