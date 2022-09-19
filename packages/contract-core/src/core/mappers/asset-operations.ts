import {
    AssetId,
    ContractBalanceResponse
} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";

export function mapAssetId(t: string): AssetId {
    return {
        value: t
    }
}


export function mapContractBalance(t: ContractBalanceResponse) {
    return {
        assetId: t.assetId,
        amount: t.amount.toNumber(),
        decimals: t.decimals
    }
}