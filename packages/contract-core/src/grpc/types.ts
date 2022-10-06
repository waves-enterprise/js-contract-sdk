import type * as ContractTypes from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import type * as TransactionTypes from "@wavesenterprise/js-contract-grpc-client/contract/contract_transaction_service";
import type * as AddressTypes from "@wavesenterprise/js-contract-grpc-client/contract/contract_address_service";
import type * as UtilsTypes from "@wavesenterprise/js-contract-grpc-client/contract/contract_util_service";
import { Client } from "@grpc/grpc-js";

type GenericClientTypes<T> = Omit<T, keyof Client>;

type OnlyFirstArg<T> = T extends (a: infer Req, b: infer P, c: infer R, d: infer D) => any
    ? P extends (error: infer E, response: infer Resp) => void
        ? (r: Req) => Promise<Resp>
        : R extends (error: infer E, response: infer Resp) => void
        ? (r: Req) => Promise<Resp>
        : D extends (error: infer E, response: infer Resp) => void
        ? (r: Req) => Promise<Resp>
        : never
    : never;

export type GenericClient<T> = {
    [key in keyof GenericClientTypes<T>]: OnlyFirstArg<T[key]>;
};

export type {
    ContractTypes as ContractTypes,
    TransactionTypes as TransactionTypes,
    AddressTypes as AddressTypes,
    UtilsTypes as UtilsTypes,
};
