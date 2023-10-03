import { DataEntry } from '@wavesenterprise/we-node-grpc-api'
import { getValueStateKey } from './index'

export function params(value: Record<string, unknown>): DataEntry[] {
  const result: DataEntry[] = []
  for (const [key, val] of Object.entries(value)) {
    const stateKey = getValueStateKey(val)

    // typescript
    switch (stateKey) {
      case 'boolValue':
        result.push({
          key,
          [stateKey]: val as any,
        })
        break
      case 'intValue':
        result.push({
          key,
          [stateKey]: val as any,
        })
        break

      case 'stringValue':
        result.push({
          key,
          [stateKey]: val as any,
        })
        break
      case 'binaryValue':
        result.push({
          key,
          [stateKey]: val as any,
        })

        break
    }
  }

  return result
}
