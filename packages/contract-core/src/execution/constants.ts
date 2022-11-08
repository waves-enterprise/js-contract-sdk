export enum ApiErrors {
  DataKeyNotExists = 304,
}

export const ERROR_CODE = {
  FATAL: 0,
  RECOVERABLE: 1,
}

export const ACTION_METADATA = 'we:contract:actions'
export const ARGS_METADATA = 'we:contract:args'

export enum ReservedParamNames {
  action = 'action',
}

export enum TxId {
  call = 104,
  create = 103,
}
