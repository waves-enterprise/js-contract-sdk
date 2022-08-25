import {ContractIssue} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_issue";
import {ContractReissue} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_reissue";
import {ContractBurn} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_burn";
import {
    ContractTransferOut
} from "@wavesenterprise/js-contract-grpc-client/contract_asset_operation/contract_transfer_out";

export type TValue = string | number | boolean | Buffer;

export type TAction = (...args: any) => void;

export type TAssetOperation = ContractIssue | ContractReissue | ContractBurn | ContractTransferOut;