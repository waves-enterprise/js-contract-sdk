import {TVal} from "../intefaces/contract";
import BN from "bn.js";

export type TParam = {
    key: string;
    value: TVal;
    type: string;
};

export class TransferIn {
    assetId?: string;
    amount: BN;
}

export interface IncomingTx {
    id: string;
    type: number;
    sender: string;
    senderPublicKey: string;
    contractId: string;
    version: number;
    fee: BN;
    proofs: Uint8Array;
    timestamp: number;
    feeAssetId?: string;
    payments: TransferIn[];
    params: TParam[];
}

export type IncomingTransactionResp = {
    authToken: string;
    tx: IncomingTx;
};
