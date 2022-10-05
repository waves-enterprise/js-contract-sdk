import {DataEntry} from '@wavesenterprise/js-contract-grpc-client/data_entry';
import {isBool, isNum, isString, nil} from '../../utils';
import {logger} from '../common/logger';
import {TValue} from '../../intefaces/contract';
import {Mapping} from './collections/mapping';
import {Storage} from './storage';
import {UnavailableStateKeyException, WrongStateKeyTypeException} from '../exceptions';
import {Optional} from '../../intefaces/helpers';
import {ExecutionContext} from "../execution/execution-context";

export interface IState {
    setString(key: string, value: string): void;

    getString(key: string): Promise<string>;

    tryGetString(key: string): Promise<Optional<string>>;

    setBool(key: string, value: boolean): void;

    getBool(key: string): Promise<boolean>;

    tryGetBool(key: string): Promise<Optional<boolean>>;

    setInt(key: string, value: number): void;

    getInt(key: string): Promise<number>;

    tryGetInt(key: string): Promise<Optional<number>>;

    setBinary(key: string, value: Buffer): void;

    getBinary(key: string): Promise<Buffer>;

    tryGetBinary(key: string): Promise<Optional<Buffer>>;

    set(key: string, value: TValue): void;
}

export class ContractState implements IState {
    private log = logger(this);

    public storage: Storage;

    constructor(
        context: ExecutionContext
    ) {
        this.storage = new Storage(context.contractId, context.rpcConnection.Contract);
    }

    async getBinary(key: string): Promise<Buffer> {
        const value = await this.internalRead(key);

        if (Buffer.isBuffer(value)) {
            return value;
        }

        throw new WrongStateKeyTypeException();
    }

    setBinary(key: string, value: Buffer) {
        this.storage.set(key, value);
    }

    tryGetBinary(key: string): Promise<Optional<Buffer>> {
        return this.withException(() => this.getBinary(key));
    }

    async getString(key: string): Promise<string> {
        const value = await this.storage.get(key);

        if (isString(value)) {
            return value as string;
        }

        throw new WrongStateKeyTypeException('');
    }

    tryGetString(key: string): Promise<Optional<string>> {
        return this.withException(() => this.getString(key));
    }

    setString(key: string, value: string): void {
        this.storage.set(key, value);
    }

    async getBool(key: string): Promise<boolean> {
        const value = await this.internalRead(key);

        if (isBool(value)) {
            return value;
        }

        throw new WrongStateKeyTypeException();
    }

    tryGetBool(key: string): Promise<Optional<boolean>> {
        return this.withException(() => this.getBool(key));
    }

    setBool(key: string, value: boolean): void {
        this.storage.set(key, value);
    }

    async getInt(key: string): Promise<number> {
        const value = await this.internalRead(key);

        if (isNum(value)) {
            return value;
        }

        throw new WrongStateKeyTypeException();
    }

    tryGetInt(key: string): Promise<Optional<number>> {
        return this.withException(() => this.getString(key));
    }

    setInt(key: string, value: number) {
        this.storage.set(key, value);
    }

    get<T extends TValue>(key: string): Promise<T> {
        return this.storage.get(key);
    }

    tryGet<T extends TValue>(key: string): Promise<Optional<T>> {
        return this.withException(() => this.storage.get(key));
    }

    set(key: string, value: any) {
        this.storage.set(key, value);
    }

    getStateEntries(): DataEntry[] {
        return this.storage.getEntries();
    }

    getMapping(prefix: string) {
        const mapping = new Mapping(this);

        mapping.setPrefix(prefix);

        return mapping;
    }

    private async internalRead(key: string) {
        return this.storage.get(key);
    }

    private withException = async (fn) => {
        try {
            return await fn();
        } catch (e) {
            if (e instanceof UnavailableStateKeyException) {
                return nil();
            }

            throw e;
        }
    };
}
