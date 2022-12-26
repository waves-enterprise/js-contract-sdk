import { DataEntry } from '@wavesenterprise/js-contract-grpc-client/data_entry'
import { TVal, TValue } from '../../intefaces/contract'
import { Storage } from './storage'
import { ExecutionContext, UnavailableStateKeyException } from '../../execution'
import { Optional } from '../../intefaces/helpers'
import { getValueStateKey } from '../../utils'

export class ContractState {

  readonly storage: Storage

  constructor(context: ExecutionContext) {
    this.storage = new Storage(context.contractId, context.grpcClient.contractService)
  }

  get<T extends TValue>(key: string, contractId?: string): Promise<T> {
    return this.storage.read(key, contractId) as Promise<T>
  }

  async tryGet<T extends TValue>(key: string, contractId?: string): Promise<Optional<T>> {
    try {
      return await this.get(key, contractId) as T
    } catch (e) {
      if (e instanceof UnavailableStateKeyException) {
        return undefined
      }
      throw e
    }
  }

  set(key: string, value: TVal) {
    this.storage.set(key, value)
  }

  getUpdatedEntries(): DataEntry[] {
    const entries: DataEntry[] = []
    const updated = Object.entries(this.storage.getUpdates())

    for (const [key, value] of updated) {
      const valueStateKey = getValueStateKey(value)

      entries.push(DataEntry.fromPartial({ key: String(key), [valueStateKey]: value }))
    }

    return entries
  }

}
