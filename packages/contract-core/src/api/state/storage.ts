import { logger } from '../'
import { ContractClient } from '../../grpc'
import { TVal } from '../../intefaces/contract'
import { _parseDataEntry } from '../../utils'

export class Storage {

  log = logger(this)

  private readonly cache = new Map<string, TVal>()

  private readonly changedKeys = new Set<string>()

  constructor(
    private readonly contractId: string,
    private readonly client: ContractClient,
  ) {
  }

  async read(key: string) {
    this.log.verbose(`Requested key ${key}, in cache`, this.cache.has(key))
    if (!this.cache.has(key)) {
      const res = await this.client.getContractKey({
        contractId: this.contractId,
        key,
      })
      this.cache.set(key, _parseDataEntry(res.entry!))
    }
    return this.cache.get(key)!
  }

  async readBatch(keys: string[]): Promise<Record<string, TVal>> {
    this.log.verbose(`Requested keys ${JSON.stringify(keys)}`)
    const cached: Record<string, TVal> = {}
    const missingKeys = keys.filter((key) => {
      if (this.cache.has(key)) {
        cached[key] = this.cache.get(key)!
        return false
      }
      return true
    })
    this.log.verbose(`Cached keys ${JSON.stringify(Object.keys(cached))}`)

    const loaded: Record<string, TVal> = {}
    if (missingKeys.length > 0) {
      const res = await this.client.getContractKeys({
        contractId: this.contractId,
        keysFilter: {
          keys: missingKeys,
        },
      })
      res.entries.forEach((entry) => {
        const parsedValue = _parseDataEntry(entry)
        this.cache.set(entry.key, parsedValue)
        loaded[entry.key] = parsedValue
      })
      this.log.verbose(`Loaded keys ${JSON.stringify(Object.keys(loaded))}`)
    }

    return {
      ...cached,
      ...loaded,
    }
  }

  set(key: string, value: TVal): void {
    this.changedKeys.add(key)
    this.cache.set(key, value)
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  getUpdates(): Record<string, TVal> {
    return Object.fromEntries(Array.from(this.cache.entries()).filter(([key]) => this.changedKeys.has(key)))
  }
}
