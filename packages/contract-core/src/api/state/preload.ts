import { getContractVarsMetadata } from '../../execution/reflect'
import { getState } from '../decorators/common'

function getPreloadKeys(contract: object, keys: Array<string | [string, string]>) {
  const contractVars = getContractVarsMetadata(contract.constructor)
  const keysMap = new Map<string, string>()
  for (const contractVarsKey in contractVars) {
    keysMap.set(contractVars[contractVarsKey].propertyKey, contractVarsKey)
  }
  return keys
    .filter((key) => keysMap.has(Array.isArray(key) ? key[0] : key))
    .map((key) => {
      if (Array.isArray(key)) {
        return keysMap.get(key[0]) + '_' + key[1]
      }
      return keysMap.get(key)!
    })
}

export async function preload<T extends object>(contract: T, keys: Array<keyof T | [keyof T, string]>): Promise<void> {
  const preloadVars = getPreloadKeys(contract, keys as string[])

  await getState()
    .storage
    .readBatch(preloadVars)
}
