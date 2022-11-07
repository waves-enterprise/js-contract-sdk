import { DataEntry } from "@wavesenterprise/js-contract-grpc-client/data_entry";
import { IncomingTx, TParam, TransferIn } from "./types";
import { _parseDataEntry } from "../utils";
import { ContractTransaction } from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import { TInt } from "../api";
import { ContractTransferIn } from "@wavesenterprise/js-contract-grpc-client/contract_transfer_in";
import { TVal } from "../intefaces/contract";

export class Param implements TParam {
    constructor(public key: string, public value: TVal) {}

    public get type(): "string" | "integer" | "binary" | "boolean" {
        // TODO based on value type
        return "string";
    }
}

export function convertTransferIn(transferIn: ContractTransferIn): TransferIn {
    return {
        assetId: transferIn.assetId[0],
        amount: TInt.fromLong(transferIn.amount),
    };
}

export function convertDataEntryToParam(entry: DataEntry): TParam {
    return new Param(entry.key, _parseDataEntry(entry));
}

export function convertContractTransaction(tx: ContractTransaction): IncomingTx {
    return {
        id: tx.id,
        type: tx.type,
        sender: tx.sender,
        senderPublicKey: tx.senderPublicKey,
        contractId: tx.contractId,
        version: tx.version,
        fee: TInt.fromLong(tx.fee),
        feeAssetId: tx.feeAssetId?.value,
        timestamp: tx.timestamp.toNumber(),
        proofs: tx.proofs,
        payments: tx.payments.map(convertTransferIn),
        params: tx.params.map(convertDataEntryToParam),
    };
}
