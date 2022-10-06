import {ServiceContainer} from "../common";
import {ContractIssue} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_issue";
import {ContractReissue} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_reissue";
import {ContractBurn} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_burn";
import {
    ContractTransferOut
} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_transfer_out";
import {ContractAssetOperation} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation";
import {RPC} from "../../grpc";
import {mapContractBalance} from "../mappers/asset-operations";
import {getExecutionContext} from "../decorators/common";
import {TInt} from "../data-types/integer";


export type TIssueParams = {
    assetId?: string;
    name: string;
    description: string;
    quantity: number;
    decimals: number;
    isReissuable: boolean;
    nonce: number;
}

export type TReissueParams = {
    assetId?: string;
    quantity: number;
    isReissuable: boolean;
}

export type TBurnParams = {
    assetId?: string;
    amount: number;
}

export type TransferOutParams = {
    assetId?: string;
    recipient: string;
    amount: number;
}

export class Asset {
    static getRPCConnection() {
        return ServiceContainer.get(RPC);
    }

    static getExecutionContext() {
        return getExecutionContext();
    }

    constructor(
        private assetId?: string,
        nonce?: number
    ) {
    }

    static from(assetId: string) {
        return new Asset(assetId);
    }

    static system() {
        return new Asset();
    }

    static async new(nonce?: number) {
        const nonceAssetId = nonce || this.getExecutionContext().getNonce();

        const assetId = await this.calculateAssetId(nonceAssetId)

        return new Asset(assetId, nonceAssetId);
    }


    issue(t: TIssueParams) {
        const operation = ContractIssue.fromPartial({
            ...t,
            assetId: this.assetId,
        });

        Asset.getExecutionContext()
            .assetOperations
            .addOperation(ContractAssetOperation.fromPartial({
                contractIssue: operation
            }))
    }

    reissue(t: TReissueParams) {
        const operation = ContractReissue.fromPartial({
            ...t,
            assetId: this.assetId,
        });

        Asset.getExecutionContext()
            .assetOperations
            .addOperation(ContractAssetOperation.fromPartial({
                contractReissue: operation
            }))
    }

    burn(t: TBurnParams) {
        const operation = ContractBurn.fromPartial({
            ...t,
            assetId: this.assetId,
        });

        Asset.getExecutionContext()
            .assetOperations
            .addOperation(ContractAssetOperation.fromPartial({
                contractBurn: operation
            }))
    }

    transfer(recipient: string, amount: number) {
        const operation = ContractTransferOut.fromPartial({
            assetId: this.assetId,
            recipient: recipient,
            amount: amount
        });

        Asset.getExecutionContext()
            .assetOperations
            .addOperation(ContractAssetOperation.fromPartial({
                contractTransferOut: operation
            }))
    }

    static async calculateAssetId(nonce: number): Promise<string> {
        const res = await Asset.getRPCConnection().Contract
            .calculateAssetId({
                nonce
            })

        return res.value;
    }

    static async balancesOf(assetIds: string[]) {
        const res = await Asset.getRPCConnection().Contract
            .getContractBalances({
                assetsIds: assetIds
            })

        return res.assetsBalances.map(mapContractBalance);
    }

    static async balanceOf(assetId?: string) {
        const res = await Asset.getRPCConnection().Contract
            .getContractBalances({
                assetsIds: [assetId ?? '']
            })

        return res.assetsBalances.map(mapContractBalance);
    }
}