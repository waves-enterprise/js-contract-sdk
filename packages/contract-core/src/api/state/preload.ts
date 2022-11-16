import { getContractEntries, getContractVarsMetadata, setContractEntries } from '../../execution/reflect'
import { getState } from '../decorators/common'
import { CommonLogger } from '../logger'
import { _parseDataEntry } from '../../utils'
import { TVar } from './types/primitives'
import { TVal } from '../../intefaces/contract'

function getPreloadKeys(contract: object, keys: string[]) {
  return Object.entries(getContractVarsMetadata(contract.constructor))
    .filter(([_, cfg]) => keys.includes(cfg.propertyKey))
}

export async function preload<T extends object>(contract: T, keys: Array<keyof T>): Promise<unknown[]> {
  const preloadVars = getPreloadKeys(contract, keys as string[])
  const entriesToBatchLoad = preloadVars.map(([varKey, { meta }]) => meta.name || varKey)

  const preloaded = getContractEntries(contract)

  const res = await getState()
    .storage
    .readBatch(entriesToBatchLoad)

  CommonLogger.info('Preload', keys, res)

  for (const [, key] of entriesToBatchLoad.entries()) {
    const preloadedEntry = res.find(r => r.key === key)

    if (preloadedEntry) {
      preloaded.set(key, _parseDataEntry(preloadedEntry))
    } else {
      preloaded.set(key, undefined as unknown as TVal)
    }
  }

  setContractEntries(contract, preloaded)

  return Promise.all(keys.map((t) => (contract[t] as unknown as TVar<unknown>).get()))
}