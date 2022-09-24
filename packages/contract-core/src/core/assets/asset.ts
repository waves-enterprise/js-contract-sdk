import {ServiceContainer} from "../service-container";
import {ContractIssue} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_issue";
import {ContractReissue} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_reissue";
import {ContractBurn} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_burn";
import {
    ContractTransferOut
} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_transfer_out";
import {Context} from "../context";
import {ContractAssetOperation} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation";
import {RPC} from "../../rpc";
import {mapAssetId, mapContractBalance} from "../mappers/asset-operations";
import {AssetId} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";


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
        return ServiceContainer.get(Context);
    }

    constructor(
        private assetId?: string
    ) {
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