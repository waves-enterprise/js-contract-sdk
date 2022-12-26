export type TVarMeta = {
  name: string,

  readonly?: boolean,
  contractId: string,
}

export type TContractVarsMeta = Record<string, { propertyKey: string, meta: Partial<TVarMeta> }>

export type TContractActionMetadata = {
  name: string,
  propertyName: string,
  params: unknown[],
  preload?: string[],
}

export type TContractActionsMetadata = {
  initializer: TContractActionMetadata,
  actions: Record<string, TContractActionMetadata>,
}

export type TArgs = {
  [key: string]: {
    index: number,
    paramKey?: string,
    getter?: () => unknown,
  },
}
