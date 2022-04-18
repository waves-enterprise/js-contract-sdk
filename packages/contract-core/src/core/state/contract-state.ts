import {Context} from "../context";
import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";
import {isBool, isNum, isString} from "../../utils";
import {logger} from "../logger";
import {TValue} from "../../intefaces/contract";
import {RPC} from "../../rpc";
import {Mapping} from "./collections/mapping";
import {Storage} from "./storage";

interface IState {
    setString(key: string, value: string): void;

    getString(key: string): Promise<string>;

    setBool(key: string, value: boolean): void;

    getBool(key: string): Promise<boolean>;

    setInt(key: string, value: number): void;

    getInt(key: string): Promise<number>;

    setBinary(key: string, value: Buffer): void;

    getBinary(key: string): Promise<Buffer>;

    set(key: string, value: TValue): void
}

export class ContractState implements IState {
    private log = logger(this)

    public storage: Storage

    constructor(
        private rpc: RPC,
        private ctx: Context
    ) {
        this.storage = new Storage(ctx.contractId, rpc.Contract);
    }

    async getBinary(key: string): Promise<Buffer> {
        const value = await this.internalRead(key)

        if (Buffer.isBuffer(value)) {
            return value;
        }
    }

    setBinary(key: string, value: Buffer) {
        this.storage.set(key, value);
    }

    async getString(key: string): Promise<string> {
        const value = await this.internalRead(key);

        if (isString(value)) {
            return value;
        }
    }

    setString(key: string, value: string): void {
        this.storage.set(key, value);
    }

    async getBool(key: string): Promise<boolean> {
        const value = await this.internalRead(key);

        if (isBool(value)) {
            return value;
        }
    }

    setBool(key: string, value: boolean): void {
        this.storage.set(key, value);
    }

    async getInt(key: string): Promise<number> {
        const value = await this.internalRead(key);

        if (isNum(value)) {
            return value;
        }
    }

    setInt(key: string, value: number) {
        this.storage.set(key, value);
    }

    get<T extends TValue>(key: string): Promise<T> {
        return this.storage.get(key) as Promise<T>;
    }

    set(key: string, value: any) {
        this.storage.set(key, value);
    }

    getStateEntries(): DataEntry[] {
        return this.storage.getEntries();
    }

    getMapping(prefix: string) {
        const mapping = new Mapping(this)

        mapping.setPrefix(prefix);

        return mapping;
    }

    private async internalRead(key: string) {
        return this.storage.get(key);
    }
}




