import {Constructable} from "../../intefaces/helpers";
import {getState} from "./common";
import {ContractError} from "../../execution";
import {CONTRACT_VARS} from "../contants";
import {TContractVarsMeta, TVarMeta} from "../meta";
import {getContractEntries, setContractEntry} from "../../execution/reflect";
import {CastTrait, PrimitiveType} from "../state/types/primitives";

export type TVarConfig = Partial<TVarMeta>

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

    const meta: TContractVarsMeta = Reflect.getMetadata(CONTRACT_VARS, target.constructor) || {};

    if (!!meta[contractKey]) {
        throw new ContractError('Variable names need to be unique')
    }

    meta[contractKey] = {
        propertyKey: propertyKey,
        meta: config
    }

    Reflect.defineMetadata(
        CONTRACT_VARS,
        meta,
        target.constructor
    );


    const VariableCastType: CastTrait = new (Reflect.getMetadata("design:type", target, propertyKey) as any)


    let _settled;

    Object.defineProperty(target, propertyKey, {
        set: () => {
            throw new Error('cannot reassign typed property')
        },
        get: () => {
            if (!_settled) {
                const res = new class extends PrimitiveType {
                    async get() {
                        const entries = getContractEntries(target);

                        let res;
                        if (entries.has(contractKey)) {
                            res = entries.get(contractKey);
                        } else {
                            res = await getState().tryGet(contractKey)
                        }

                        this.settle(res)

                        return this.castToTargetType();
                    }

                    set(value: any) {
                        if (!config.mutable) {
                            throw new ContractError(`Trying to set immutable variable "${contractKey}" in call transaction `)
                        }

                        setContractEntry(target, contractKey, value);
                        getState().set(contractKey, value)
                    }
                }

                _settled = res;
            }

            return _settled
        }
    });
}