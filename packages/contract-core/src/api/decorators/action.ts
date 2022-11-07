import {ACTION_METADATA} from '../contants';
import {Constructable} from '../../intefaces/helpers';
import {TContractActionMetadata, TContractActionsMetadata} from "../meta";

type TContractActionOptions = {
    name?: string;
    onInit?: boolean;
};

const defaultContractOptions: TContractActionOptions = {
    onInit: false,
};

export function Action(target: object, propertyName: string | symbol, descriptor): void;
export function Action(options?: TContractActionOptions): MethodDecorator;

export function Action(...args): MethodDecorator | void {
    if (arguments.length > 1) {
        decorateMethod(args[0], args[1], args[2]);

        return;
    }

    const config = args[0];

    return function (target: Constructable<any>, propertyName: string | symbol, descriptor): void {
        decorateMethod(target, propertyName, descriptor, config);
    };
}

const decorateMethod = (
    target: Constructable<any>,
    propertyName: string | symbol,
    descriptor,
    options: TContractActionOptions = defaultContractOptions,
) => {
    let actionsMetadata: TContractActionsMetadata = Reflect.getMetadata(ACTION_METADATA, target.constructor);

    if (!actionsMetadata) {
        actionsMetadata = {actions: {} as Record<string, TContractActionMetadata>} as TContractActionsMetadata;
    }

    const actionName = options?.name ?? (propertyName as string)
    const actionMetadata = {
        name: options?.name ? options.name : (propertyName as string),
        propertyName: propertyName as string,
        params: Reflect.getMetadata('design:paramtypes', target, propertyName as string),
    };

    if (options.onInit) {
        actionsMetadata['initializer'] = actionMetadata
    } else {
        actionsMetadata.actions[actionName] = actionMetadata
    }


    Reflect.defineMetadata(ACTION_METADATA, actionsMetadata, target.constructor);
};
