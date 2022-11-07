import { TInt } from "../api";
import { TVal } from "../intefaces/contract";

export type TParam = {
    key: string;
    value: TVal;
    type: string;
};

export class TransferIn {
    assetId?: string;
    amount: TInt;
}

export interface IncomingTx {
    id: string;
    type: number;
    sender: string;
    senderPublicKey: string;
    contractId: string;
    version: number;
    fee: TInt;
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
