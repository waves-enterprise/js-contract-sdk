import { logger } from '../'
import { TVal } from '../../intefaces/contract'
import { _parseDataEntry } from '../../utils'
import { ContractService } from '@wavesenterprise/we-node-grpc-api'

export class Storage {

  log = logger(this)

  private readonly cache = new Map<string, TVal>()

  private readonly changedKeys = new Set<string>()

  constructor(
    private readonly contractId: string,
    private readonly client: ContractService,
  ) {
  }

  private composeCacheKey = (contractId: string, key: string) => {
    return `${contractId}:${key}`
  }

  async read(key: string, contractId?: string) {
    const actualContractId = contractId ?? this.contractId
    const cacheKey = this.composeCacheKey(actualContractId, key)
    this.log.verbose(`Requested key ${cacheKey}, in cache`, this.cache.has(cacheKey))
    if (!this.cache.has(cacheKey)) {
      const res = await this.client.getContractKey({
        contractId: actualContractId,
        key,
      })
      this.cache.set(cacheKey, _parseDataEntry(res))
    }
    return this.cache.get(cacheKey)!
  }

  async readBatch(keys: string[], contractId?: string): Promise<Record<string, TVal>> {
    const actualContractId = contractId ?? this.contractId
    const cacheKeys = keys.map((key) => this.composeCacheKey(actualContractId, key))
    this.log.verbose(`Requested keys ${JSON.stringify(cacheKeys)}`)
    const cached: Record<string, TVal> = {}
    const missingKeys = keys.filter((key) => {
      const cacheKey = this.composeCacheKey(actualContractId, key)
      if (this.cache.has(cacheKey)) {
        cached[cacheKey] = this.cache.get(cacheKey)!
        return false
      }
      return true
    })
    this.log.verbose(`Cached keys ${JSON.stringify(Object.keys(cached))}`)

    const loaded: Record<string, TVal> = {}
    if (missingKeys.length > 0) {
      const res = await this.client.getContractKeys({
        contractId: actualContractId,
        keysFilter: {
          keys: missingKeys,
        },
      })
      res.forEach((entry) => {
        const parsedValue = _parseDataEntry(entry)
        this.cache.set(this.composeCacheKey(actualContractId, entry.key), parsedValue)
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
    // modification of external contracts state is prohibited
    this.changedKeys.add(key)
    this.cache.set(this.composeCacheKey(this.contractId, key), value)
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  getUpdates(): Record<string, TVal> {
    return Object.fromEntries(
      Array.from(this.cache.entries())
        .filter(([key]) => this.changedKeys.has(this.composeCacheKey(this.contractId, key))),
    )
  }
}
