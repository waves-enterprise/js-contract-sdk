import {TValue} from "../../intefaces/contract";
import {ReadContractStateException} from "../exceptions";
import {DataEntry} from "@wavesenterprise/js-contract-grpc-client/data_entry";
import {getValueStateKey} from "../../utils";
import {Optional} from "../../intefaces/helpers";

export class InternalContractState {
    private internalState = new Map<string, TValue>();

    constructor(private _cache: Map<string, TValue>) {
    }

    write(key: string, value: any) {
        this.internalState.set(key, value);
    }

    has(key: string): boolean {
        return this.internalState.has(key) || this._cache.has(key);
    }

    get(key: string): Optional<TValue> {
        if (this.internalState.has(key)) {
            return this.internalState.get(key)
        } else if (this._cache.has(key)) {
            return this._cache.get(key)
        }
    }

    getEntries(): DataEntry[] {
        let entries: DataEntry[] = [];

        for (const [key, value] of this.internalState.entries()) {
            const valueStateKey = getValueStateKey(value);

            entries.push(
                DataEntry.fromPartial({key: String(key), [valueStateKey]: value} as any)
            )
        }

        return entries;
    }
}