import { getContractVarsMetadata } from '../../execution/reflect'
import { getState } from '../decorators/common'

function getPreloadKeys(contract: object, keys: Array<string | [string, string]>) {
  const contractVars = getContractVarsMetadata(contract.constructor)
  const keysMap = new Map<string, { contractKey, contractId?: string }>()
  for (const contractVarsKey in contractVars) {
    const { propertyKey, meta } = contractVars[contractVarsKey]
    keysMap.set(propertyKey, {
      contractKey: contractVarsKey,
      contractId: meta.contractId,
    })
  }
  return keys
    .filter((key) => keysMap.has(Array.isArray(key) ? key[0] : key))
    .map((key) => {
      if (Array.isArray(key)) {
        const keyData = keysMap.get(key[0])!
        return {
          contractKey: keyData.contractKey + '_' + key[1],
          contractId: keyData.contractId,
        }
      }
      return keysMap.get(key)!
    })
}

export async function preload<T extends object>(contract: T, keys: Array<keyof T | [keyof T, string]>): Promise<void> {
  const preloadVars = getPreloadKeys(contract, keys as string[])
  if (preloadVars.length > 0) {
    const contractGroups = new Map<string | undefined, string[]>()
    for (const keyData of preloadVars) {
      const { contractId, contractKey } = keyData
      if (!contractGroups.has(contractId)) {
        contractGroups.set(contractId, [])
      }
      contractGroups.get(contractId)!.push(contractKey)
    }
    await Promise.all(Array.from(contractGroups.entries()).map(async ([contractId, keys]) => {
      await getState().getBatch(keys, contractId)
    }))
  }
}
