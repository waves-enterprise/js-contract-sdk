import {IStateWriter} from "./interfaces";
import {getValueStateKey} from "../../utils";
import {DataEntry} from "@waves-enterprise/js-contract-grpc-client/data_entry";

export class StateWriter implements IStateWriter {
    private internalState = new Map();

    write(key: string, value: any) {
        this.internalState.set(key, value);
    }


    getDataEntries() {
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