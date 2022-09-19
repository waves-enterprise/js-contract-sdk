export const strToBytes = (str: string) => {
    return new TextEncoder().encode(str)
}

export const bytesToString = (bytes: Uint8Array) => {
    return new TextDecoder().decode(bytes)
}
