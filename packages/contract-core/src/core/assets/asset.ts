import {ServiceContainer} from "../service-container";
import {ContractIssue} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_issue";
import {ContractReissue} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_reissue";
import {ContractBurn} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_burn";
import {
    ContractTransferOut
} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_transfer_out";
import {Context} from "../context";

export type TIssueParams = {
    assetId: string;
    name: string;
    description: string;
    quantity: number;
    decimals: number;
    isReissuable: boolean;
    nonce: number;
}

export type TReissueParams = {
    assetId: string;
    quantity: number;
    isReissuable: boolean;
}

export type TBurnParams = {
    assetId: Uint8Array | undefined;
    amount: number;
}

export type TransferOutParams = {
    assetId: string;
    recipient: string;
    amount: number;
}

export class Asset {
    static getExecutionContext() {
        return ServiceContainer
            .get(Context);
    }

    constructor(
        private assetId: string
    ) {
    }

    issue(t: TIssueParams) {
        const operation = ContractIssue.fromPartial({
            ...t,
            name: new Uint8Array(Buffer.from(t.name)),
            assetId: new Uint8Array(Buffer.from(this.assetId)),
            description: new Uint8Array(Buffer.from(t.description))
        });

        Asset.getExecutionContext()
            .assetOperations
            .addOperation(operation)
    }

    reissue(t: TReissueParams) {
        const operation = ContractReissue.fromPartial({
            ...t,
            assetId: new Uint8Array(Buffer.from(this.assetId)),
        });

        Asset.getExecutionContext()
            .assetOperations
            .addOperation(operation)
    }

    burn(t: TBurnParams) {
        const operation = ContractBurn.fromPartial({
            ...t,
            assetId: new Uint8Array(Buffer.from(this.assetId)),
        });

        Asset.getExecutionContext()
            .assetOperations
            .addOperation(operation)
    }

    transfer(recipient: string, amount: number) {
        const operation = ContractTransferOut.fromPartial({
            assetId: new Uint8Array(Buffer.from(this.assetId)),
            recipient: new Uint8Array(Buffer.from(recipient)),
            amount: amount
        });

        Asset.getExecutionContext()
            .assetOperations
            .addOperation(operation)
    }
}