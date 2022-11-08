import {Constructable} from '../../intefaces/helpers';
import {CONTRACT_PRELOADED_ENTRIES} from "../contants";

type ContractOptions<T = unknown> = {
    component: string;
};

export function Contract<T extends Constructable<any>>(): any;
export function Contract<T = unknown>(options: ContractOptions<T>): T | void;
export function Contract<T>(_: ContractOptions<T> = {component: 'default'}): ClassDecorator {
    return <T>(target: any) => {

        Reflect.defineMetadata(CONTRACT_PRELOADED_ENTRIES, new Map, target);
    };
}
