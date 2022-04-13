import {StateReader} from "./state-reader";
import {StateWriter} from "./state-writer";
import {Context} from "../context";
import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";
import {isBool, isNum, isString, parseDataEntry} from "../../utils";
import {logger} from "../logger";
import {TValue} from "../../intefaces/contract";
import {IStateReader, IStateWriter} from "./interfaces";
import {RPC} from "../../rpc";

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
    log = logger(this)

    public readonly reader: IStateReader;
    public readonly writer: IStateWriter;

    constructor(
        private rpc: RPC,
        private ctx: Context
    ) {

        this.reader = new StateReader(
            ctx.contractId,
            rpc.Contract
        )
        this.writer = new StateWriter();
    }

    async getBinary(key: string): Promise<Buffer> {
        const value = await this.internalRead(key)

        if (Buffer.isBuffer(value)) {
            return value;
        }

        return Buffer.from(value.toString());
    }

    setBinary(key: string, value: Buffer) {
        this.writer.write(key, value);
    }

    async getString(key: string): Promise<string> {
        const value = await this.internalRead(key);

        if (isString(value)) {
            return value;
        }

        return value.toString();
    }

    setString(key: string, value: string): void {
        this.writer.write(key, value);
    }

    async getBool(key: string): Promise<boolean> {
        const value = await this.internalRead(key);

        if (isBool(value)) {
            return value;
        }

        return Boolean(value);
    }

    setBool(key: string, value: boolean): void {
        this.writer.write(key, value);
    }

    async getInt(key: string): Promise<number> {
        const value = await this.internalRead(key);

        if (isNum(value)) {
            return value;
        }

        return parseInt(value.toString());
    }

    setInt(key: string, value: number) {
        this.writer.write(key, value);
    }

    async get<T extends TValue>(key: string): Promise<T> {
        try {
            const entry = await this.reader.readOne(key);

            return parseDataEntry(entry) as T;
        } catch (e) {
            this.log.info('Get key errored', e)

            return;
        }
    }

    set(key: string, value: any) {
        this.writer.write(key, value);
    }

    private async internalRead(key: string) {
        const entry = await this.reader.readOne(key);

        return parseDataEntry(entry);
    }

    getStateEntries(): DataEntry[] {
        return this.writer.getEntries();
    }

    getMapping(prefix: string) {
        const mapping = new Mapping(this)

        mapping.setPrefix(prefix);

        return mapping;
    }
}


const MAPPING_DELIMITER = "_";

class Mapping {
    prefix: string;

    constructor(private state: ContractState) {
    }

    setPrefix(prefix: string) {
        this.prefix = prefix + MAPPING_DELIMITER;
    }

    private key(el: string) {
        return this.prefix + el;
    }

    get<T extends TValue>(el: string): Promise<T> {
        return this.state.get(this.key(el));
    }

    set<T extends TValue>(el: string, value: TValue) {
        return this.state.set(this.key(el), value);
    }
}

