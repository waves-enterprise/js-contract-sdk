import {Constructable} from "../intefaces/helpers";
import {Context} from "./context";
import {ACTION_METADATA, ARGS_METADATA} from "./consts";
import {ContractState} from "./state/contract-state";
import {TContractActionsMetadata} from "./decorators/action";
import {TArgs} from "./decorators/param";
import {logger} from "./logger";
import {UnavailableContractActionException, UnavailableContractParamException} from "./exceptions";

export class ActionResolver {
    log = logger(this);

    async invoke(contract: Constructable<any>, ctx: Context, state: ContractState) {
        const metadata = this.getContractMetadata(contract);

        const actionData = metadata.actions
            .find(a => {
                if (ctx.isInit) {
                    return a.onInit === true
                }
                return a.name === ctx.params.get('action')
            })

        if (!actionData) {
            throw new UnavailableContractActionException;
        }

        const c = new contract();

        const argsMetadata: TArgs = this.getArgsMetadata(contract, actionData.propertyName);

        const actionArgs = [];

        for (let value of Object.values(argsMetadata)) {
            const arg = ctx.params.get(value.paramKey);

            if (!arg) {
                throw new UnavailableContractParamException;
            }

            actionArgs[value.index] = arg;
        }

        await (c[actionData.propertyName] as Function)(...actionArgs);
    }

    private getContractMetadata(contract: Constructable<any>): TContractActionsMetadata {
        return Reflect.getMetadata(ACTION_METADATA, contract)
    }

    private getArgsMetadata(contract: Constructable<any>, property: string): TArgs {
        return Reflect.getMetadata(ARGS_METADATA, contract, property)
    }
}