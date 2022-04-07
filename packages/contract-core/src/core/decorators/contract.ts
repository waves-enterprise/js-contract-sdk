import {ContractRegistry} from "../contract-registry";
import {Constructable} from "../../intefaces/helpers";

type ContractOptions<T = unknown> = {
    component: string
}

export function Contract<T = unknown>(): Function;
export function Contract<T = unknown>(options: ContractOptions<T>): Function;
export function Contract<T>(options: ContractOptions<T> = {component: 'default'}): ClassDecorator {
    return (targetConstructor) => {
        if (options.component === 'default') {
            ContractRegistry.add(options.component, targetConstructor as unknown as Constructable<any>);
        }

        // TODO multiple contracts implementations
    };
}