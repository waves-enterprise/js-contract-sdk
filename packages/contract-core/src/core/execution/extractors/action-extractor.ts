import {UnavailableContractActionException, UnavailableContractParamException} from "../../exceptions";
import {Constructable} from "../../../intefaces/helpers";
import {ExecutionContext} from "../execution-context";
import {getContractMetadata} from "../../reflect/getContractMetadata";
import {ReservedParamNames, TxId} from "../../consts";
import {TContractActionMetadata} from "../../decorators/action";

export class ContractActionMetadataExtractor {
    extract(contract: Constructable<any>, executionContext: ExecutionContext): TContractActionMetadata {
        const metadata = getContractMetadata(contract);

        switch (executionContext.tx.type as TxId) {
            case TxId.create:
                return metadata.initializer
            case TxId.call:
                const actionName = executionContext.params.get(ReservedParamNames.action)

                if (!actionName) {
                    throw new UnavailableContractParamException(ReservedParamNames.action);
                }

                const actionMetadata = metadata.actions[actionName]

                if (!actionMetadata) {
                    throw new UnavailableContractActionException(actionName);
                }

                return actionMetadata
        }
    }
}