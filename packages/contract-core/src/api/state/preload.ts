import {
    getContractEntries,
    getContractVarsMetadata,
    setContractEntries
} from "../../execution/reflect";
import {getState} from "../decorators/common";

function getPreloadKeys(contract: any, keys: string[]) {
    return Object.entries(getContractVarsMetadata(contract.constructor))
        .filter(([_, cfg]) => keys.includes(cfg.propertyKey))
}

export async function preload<T extends object>(contract: T, keys: (keyof T)[]) {
    const preloadVars = getPreloadKeys(contract, keys as string[])
    const entriesToBatchLoad = preloadVars.map(([varKey, {meta}]) => meta.name || varKey)

    const preloaded = getContractEntries(contract);

    const res = await getState()
        .storage
        .readBatch(entriesToBatchLoad)

    for (let [index] of entriesToBatchLoad.entries()) {
        const preloadedValue = res[index];
        const [varKey, {meta}] = preloadVars[index]

        preloaded.set(meta.name || varKey, preloadedValue)
    }

    setContractEntries(contract, preloaded);
}