import {Constructable} from "../../intefaces/helpers";
import {getState} from "./common";
import {ContractError} from "../../execution";

export type TVarConfig = Partial<{
    name: string;
    mutable: boolean;
    eager: boolean;
}>


const DefaultConfig: TVarConfig = {
    mutable: true,
    eager: false
}

export function Var(target: object, propertyName: string | symbol, descriptor): any
export function Var(): PropertyDecorator;
export function Var(props: TVarConfig): any;
export function Var(...args: any[]) {
    if (args.length > 1) {
        return decorateProperty.call(undefined, ...args, DefaultConfig);
    }

    const config = {
        ...DefaultConfig,
        ...(args[0] || {}),
    }

    return (...args_: any[]) => decorateProperty.call(undefined, ...args_, config);
}

export function decorateProperty(target: Constructable<any>, propertyKey: string, _, config: TVarConfig) {
    const contractKey = config.name || propertyKey

    Object.defineProperty(target, propertyKey, {
        set: () => {
            throw new Error('cannot reassign typed property')
        },
        get: () => {
            return {
                get() {
                    return getState().tryGet(contractKey)
                },
                set(value: any) {
                    if (!config.mutable) {
                        throw new ContractError(`Trying to set immutable variable "${contractKey}" in call transaction `)
                    }

                    getState().set(contractKey, value)
                }
            }
        }
    });
}