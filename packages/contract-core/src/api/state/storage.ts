import { logger } from '../'
import { TVal } from '../../intefaces/contract'
import { _parseDataEntry } from '../../utils'
import { IContractService } from '../../grpc/grpc-client'

export class Storage {

  log = logger(this)

  private readonly cache = new Map<string, TVal>()

  private readonly changedKeys = new Set<string>()

  constructor(
    private readonly contractId: string,
    private readonly client: IContractService,
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

      if (res) {
        this.cache.set(cacheKey, _parseDataEntry(res))
      }

    }
    return this.cache.get(cacheKey)!
  }

  async readAll(contractId?: string): Promise<Record<string, TVal>> {
    const actualContractId = contractId ?? this.contractId
    const res = await this.client.getContractKeys({
      contractId: actualContractId,
    })
    const loaded: Record<string, TVal> = {}
    res.forEach((entry) => {
      const parsedValue = _parseDataEntry(entry)
      loaded[entry.key] = parsedValue
    })
    return loaded
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
    this.log.verbose(`Missing keys are ${JSON.stringify(missingKeys)}`)
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
      Array.from(this.changedKeys.values())
        .map((changedKey) => {
          return [changedKey, this.cache.get(this.composeCacheKey(this.contractId, changedKey))!]
        }),
    )
  }
}
