export const strToBytes = (str: string) => {
    return new TextEncoder().encode(str)
}