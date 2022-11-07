import {ContractAssetOperation} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation";


export class AssetOperationsRegistry {
    operations: ContractAssetOperation[] = [];

    addOperation(operation: ContractAssetOperation) {
        this.operations.push(operation)
    }
}