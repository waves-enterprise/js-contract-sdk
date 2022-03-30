import {Constructable} from "../intefaces/helpers";
import {Context} from "./context";
import {ACTION_METADATA} from "./consts";
import {ServiceContainer} from "./service-container";
import {ContractState} from "./state/contract-state";
import {TContractActionsMetadata} from "./decorators/action";


export class ActionResolver {
    invoke(contract: Constructable<any>, ctx: Context, state: ContractState) {
        const metadata = this.getContractMetadata(contract);

        const actionData = metadata.actions
            .find(a => {
                if (ctx.isInit) {
                    return a.onInit === true
                }

                return a.name === ctx.params.get('action')
            })

        if (!actionData) {
            throw new Error('[ActionResolver] Action not founded');
        }

        const c = new contract();

        const actionArgs = actionData.params.map((p) => {

            return ServiceContainer.get(p);
        });

        (c[actionData.propertyName] as Function)(...actionArgs);
    }

    private getContractMetadata(contract: Constructable<any>): TContractActionsMetadata {
        return Reflect.getMetadata(ACTION_METADATA, contract)
    }
}