import { Constructable } from '../intefaces/helpers';
import { Context } from './context';
import { ContractState } from './state';
import { TArgs } from './decorators/param';
import { logger } from './logger';
import { UnavailableContractActionException, UnavailableContractParamException } from './exceptions';
import { isUndefined } from '../utils';
import { TAction, TValue } from '../intefaces/contract';
import { getArgsMetadata, getContractMetadata } from '../utils/reflect';

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

        const actionArgs = [] as TValue[];

        for (const value of Object.values(argsMetadata)) {
            const arg = ctx.params.get(value.paramKey);

            if (isUndefined(arg)) {
                throw new UnavailableContractParamException();
            }

            actionArgs[value.index] = arg;
        }

        try {
            await (c[actionData.propertyName] as TAction)(...actionArgs);
            this.log.info('Action proccesed');
        } catch (e) {
            return Promise.reject(e);
        }
    }
}
