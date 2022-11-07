import {Constructable} from '../../intefaces/helpers';

type ContractOptions<T = unknown> = {
    component: string;
};

export function Contract<T extends Constructable<any>>(): any;
export function Contract<T = unknown>(options: ContractOptions<T>): T | void;
export function Contract<T>(_: ContractOptions<T> = {component: 'default'}): ClassDecorator {
    return (_) => {

    };
}
