import {ContractTransaction} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {TInt} from "../data-types/integer";
import {Params} from "./params";
import {IncomingTx} from "../types/core";
import {TransferInConverter} from "./transfer-in";

export class TransactionConverter {
    parse(tx: ContractTransaction): IncomingTx {
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
            payments: tx.payments.map(TransferInConverter.parse),
            params: tx.params.map(Params.parse),
        }
    }
}