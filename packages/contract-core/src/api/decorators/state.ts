import {ExecutionContext} from '../../execution';
import {Constructable} from '../../intefaces/helpers';
import {getState} from "./common";
import {Container} from "../container";


export function State(): PropertyDecorator;
export function State(target: object, propertyKey: string): any;
export function State(...args: any[]) {
    if (args.length > 1) {
        return decorateState(args[0], args[1]);
    }

    return (target: Constructable<any>, propertyKey: string) => decorateState(target, propertyKey);
}

const decorateState = (target: Constructable<any>, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
        get(): any {
            return getState();
        },
        set(v: any) {
            throw new Error('Contract state is initialized');
        },
    });
};

export function Ctx(): PropertyDecorator;
export function Ctx(target: object, propertyKey: string): any;
export function Ctx(...args: any[]) {
    if (args.length > 1) {
        return decorateContext(args[0], args[1]);
    }

    return (target: Constructable<any>, propertyKey: string) => decorateContext(target, propertyKey);
}

const decorateContext = (target: Constructable<any>, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
        get(): any {
            return Container.get(ExecutionContext);
        },
        set(v: any) {
            throw new Error('Context is initialized');
        },
    });
};
