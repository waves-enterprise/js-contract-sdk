import * as os from 'os'
import { DataEntry } from '@wavesenterprise/we-node-grpc-api'
import { TVal, TValue } from '../intefaces/contract'
import Long from 'long'

export const isUndefined = (v: unknown): v is undefined => {
  return v === undefined
}

export const isString = (v: unknown): v is string => {
  return typeof v === 'string'
}

export const isBool = (v: unknown): v is boolean => {
  return typeof v === 'boolean'
}

export const isNum = (v: unknown): v is number => {
  return typeof v === 'number'
}

export function nil() {
  return undefined
}

export function getValueStateKey(v: unknown): 'boolValue' | 'intValue' | 'binaryValue' | 'stringValue' {
  if (isBool(v)) {
    return 'boolValue'
  }

  if (isNum(v)) {
    return 'intValue'
  }

  if (v instanceof Uint8Array) {
    return 'binaryValue'
  }

  return 'stringValue'
}

export function _parseDataEntry(d: DataEntry): TVal {
  if ('stringValue' in d && !isUndefined(d.stringValue)) {
    return d.stringValue
  }

  if ('intValue' in d && !isUndefined(d.intValue)) {
    return Number(d.intValue)
  }

  if ('boolValue' in d && !isUndefined(d.boolValue)) {
    return d.boolValue
  }

  if ('binaryValue' in d && !isUndefined(d.binaryValue)) {
    return Buffer.from(d.binaryValue)
  }

  throw new Error('Data entry parse error')
}

export function parseDataEntry(d: DataEntry): TValue {
  if ('stringValue' in d && !isUndefined(d.stringValue)) {
    return d.stringValue
  }

  if ('intValue' in d && !isUndefined(d.intValue)) {
    return Long.fromValue(d.intValue).toNumber()
  }

  if ('boolValue' in d && !isUndefined(d.boolValue)) {
    return d.boolValue
  }

  if ('binaryValue' in d && !isUndefined(d.binaryValue)) {
    return Buffer.from(d.binaryValue)
  }

  throw new Error('Data entry parse error')
}

export function isPrimitive(v: ObjectConstructor) {
  return (
    v.prototype === String.prototype ||
    v.prototype === Number.prototype ||
    v.prototype === Boolean.prototype ||
    v.prototype === Buffer.prototype
  )
}

export function isWrappedType(v: unknown) {
  return Long === v
}

export const getCpusCount = () => os.cpus().length
