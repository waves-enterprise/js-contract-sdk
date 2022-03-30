// import {ServiceContainer} from "../service-container";
// import {ContractState} from "../ContractState";
//
// export function StateEntry<T>(target: T, propertyName: string | Symbol, descriptor: void | TypedPropertyDescriptor<T>): void | any;
// // export function StateEntry<T>(options: any): MethodDecorator;
// export function StateEntry() {
//
//     return <T = any>(
//         target: T,
//         propertyName: string | Symbol,
//         descriptor: void | TypedPropertyDescriptor<T>
//     ): void | any => {
//         return decorateMethod(target, propertyName, descriptor)
//     }
// }
//
// const decorateMethod = <T = object>(
//     target: T,
//     propertyName: string | Symbol,
//     descriptor: void | TypedPropertyDescriptor<T>
// ) => {
//     const state = ServiceContainer.get(ContractState);
//
//     const desc: PropertyDescriptor = {
//         ...descriptor,
//
//         set(v: any) {
//             return state.set(propertyName as string, v);
//         },
//
//         get(): Promise<any> {
//             return state.get(propertyName as string);
//         }
//     }
//
//     return desc;
// }
