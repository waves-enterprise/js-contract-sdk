export type TVarMeta = {
  name: string,
  mutable: boolean,
  eager: boolean,
}

export type TContractVarsMeta = Record<string, { propertyKey: string, meta: Partial<TVarMeta> }>

export type TContractActionMetadata = {
  name: string,
  propertyName: string,
  params: unknown[],
}

export type TContractActionsMetadata = {
  initializer: TContractActionMetadata,
  actions: Record<string, TContractActionMetadata>,
}

export type TArgs = {
  [key: string]: {
    index: number,
    paramKey: string,
  },
}
