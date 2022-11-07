export type TContractActionMetadata = {
    name: string;
    propertyName: string;
    params: any[];
};

export type TContractActionsMetadata = {
    initializer: TContractActionMetadata;
    actions: Record<string, TContractActionMetadata>;
};

export type TArgs = {
    [key: string]: {
        index: number;
        paramKey: string;
    };
};
