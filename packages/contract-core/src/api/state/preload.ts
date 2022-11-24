import { getContractVarsMetadata } from '../../execution/reflect'
import { getState } from '../decorators/common'

function getPreloadKeys(contract: object, keys: string[]) {
  return Object.entries(getContractVarsMetadata(contract.constructor))
    .filter(([_, cfg]) => keys.includes(cfg.propertyKey))
}

export async function preload<T extends object>(contract: T, keys: Array<keyof T>): Promise<void> {
  const preloadVars = getPreloadKeys(contract, keys as string[])
  const entriesToBatchLoad = preloadVars.map(([varKey, { meta }]) => meta.name || varKey)

  await getState()
    .storage
    .readBatch(entriesToBatchLoad)
}
