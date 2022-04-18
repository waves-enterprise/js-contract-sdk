import {TValue} from "../../../intefaces/contract";
import {ContractState} from "../contract-state";

const MAPPING_DELIMITER = "_";

export class Mapping {
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