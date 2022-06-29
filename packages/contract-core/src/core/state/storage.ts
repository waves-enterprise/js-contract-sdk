import { logger } from '../logger';
import { ContractClient } from '../../rpc';
import { TValue } from '../../intefaces/contract';
import { ContractKeysRequest } from '@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service';
import { isString, parseDataEntry } from '../../utils';
import { InternalContractState } from './internal-contract-state';
import { DataEntry } from '@wavesenterprise/js-contract-grpc-client/data_entry';

const DEL = '@@__deleted';

type GetConfig = Omit<ContractKeysRequest, 'contractId'>;

export class Storage {
    private internalState: InternalContractState;

    log = logger(this);

    constructor(
        private readonly contractId: string,
        private readonly client: ContractClient,
        private readonly _cache: Map<string, TValue> = new Map(),
    ) {
        this.internalState = new InternalContractState(_cache);
    }

    get(config: GetConfig): Promise<TValue[]>;
    get<T extends TValue>(key): Promise<T>;
    get(keys: string[], config?: Omit<GetConfig, 'matches'>): Promise<TValue[]>;
    async get(...args: any[]): Promise<any> {
        if (isString(args[0])) {
            const key = args[0];
            const contractId = this.contractId;

            if (this.internalState.has(key)) {
                return this.internalState.get(key);
            }

            const resp = await this.client.getContractKey({ key, contractId });

            const value = parseDataEntry(resp.entry as DataEntry);

            this._cache.set(key, value);

            return value;
        } else if (Array.isArray(args[0])) {
            const request = args[1] || {};
            const keys = args[0];

            // TODO: get from internal state

            const response = await this.client.getContractKeys({
                ...request,
                keysFilter: [...keys],
            });

            const entries = response.entries.map((e) => {
                return [e.key, parseDataEntry(e)] as [string, TValue];
            });

            for (const [key, val] of entries) {
                this._cache.set(key, val);
            }
            return entries.map(([, val]) => val);
        }

        const response = await this.client.getContractKeys(args[0]);

        // TODO: cache request by config
        const entries = response.entries.map((e) => {
            return [e.key, parseDataEntry(e)] as [string, TValue];
        });

        for (const [key, val] of entries) {
            this._cache.set(key, val);
        }

        return entries.map(([, val]) => val);
    }

    async has(key: string): Promise<boolean> {
        if (this.internalState.has(key)) {
            return Promise.resolve(true);
        }

        const { entry } = await this.client.getContractKey({
            contractId: this.contractId,
            key,
        });

        return Boolean(entry && entry.stringValue !== DEL);
    }

    set(key: string, value: TValue): void {
        this.internalState.write(key, value);
    }

    delete(key: string) {
        this.internalState.write(key, DEL);
    }

    getEntries(): DataEntry[] {
        return this.internalState.getEntries();
    }
}
