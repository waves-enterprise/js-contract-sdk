import {TAssetOperation} from "../../intefaces/contract";


export class AssetOperationsRegistry {
    operations: TAssetOperation[] = [];

    addOperation(operation: TAssetOperation) {
        this.operations.push(operation)
    }
}