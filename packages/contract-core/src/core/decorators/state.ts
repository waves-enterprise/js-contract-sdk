import {ServiceContainer} from "../service-container";
import {ContractState} from "../state/contract-state";
import {Context} from "../context";

export function State(): PropertyDecorator;

export function State() {
    return (
        target: Object, propertyKey: string
    ) => {

        Object.defineProperty(target, propertyKey, {
            get(): any {
                return ServiceContainer.get(ContractState);
            },
            set(v: any) {

                throw new Error('Contract state is initialized')
            },
        })
    }
}

export function Ctx() {
    return (
        target: Object, propertyKey: string
    ) => {

        Object.defineProperty(target, propertyKey, {
            get(): any {
                return ServiceContainer.get(Context);
            },
            set(v: any) {

                throw new Error('Context is initialized')
            },
        })
    }
}