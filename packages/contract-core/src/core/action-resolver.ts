import {Constructable} from '../intefaces/helpers';
import {Context} from './context';
import {ContractState} from './state';
import {TArgs} from './decorators/param';
import {logger} from './logger';
import {UnavailableContractActionException} from './exceptions';
import {TAction} from '../intefaces/contract';
import {getArgsMetadata, getContractMetadata} from '../utils/reflect';
import {ServiceContainer} from "./service-container";

export class ActionResolver {
    log = logger(this);

    async invoke(contract: Constructable<any>, ctx: Context, _state: ContractState) {
        const metadata = getContractMetadata(contract);

        const actionData = metadata.actions.find((a) => {
            if (ctx.isInit) {
                return a.onInit;
            }
            return a.name === ctx.params.get('action');
        });

        if (!actionData) {
            throw new UnavailableContractActionException();
        }

        const c = new contract();

        const argsMetadata: TArgs = getArgsMetadata(contract, actionData.propertyName);


        const paramTypes = Reflect.getMetadata(
            'design:paramtypes',
            contract.prototype,
            actionData.propertyName
        ) as Array<any>;

        const actionArgs = new Array(paramTypes.length)

        for (const [paramIndex, param] of paramTypes.entries()) {
            if (param.prototype === String.prototype) {
                const argAtIndex = Object
                    .values(argsMetadata)
                    .find(t => t.index === paramIndex);

                if (!argAtIndex) {
                    throw new Error(`Parameter at index "${paramIndex}" not founded`)
                }

                actionArgs[paramIndex] = ctx.params.get(argAtIndex.paramKey);
            } else {
                const resolvedDependency = ServiceContainer.get(param)

                if (!resolvedDependency) {
                    throw new Error(`Action ${actionData.propertyName} Parameter at index "${paramIndex}" not founded. Instance of ${param.name} not provided`)
                }

                actionArgs[paramIndex] = resolvedDependency;
            }
        }

        try {
            await (c[actionData.propertyName] as TAction)(...actionArgs);
            this.log.info('Action proccesed');
        } catch (e) {
            return Promise.reject(e);
        }
    }

    tryInjectParam() {

    }
}
