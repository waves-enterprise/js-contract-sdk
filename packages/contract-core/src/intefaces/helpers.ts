export type Constructable<T> = new (...args: any[]) => T

export type Optional<T> = T | undefined

// eslint-disable-next-line @typescript-eslint/prefer-function-type,@typescript-eslint/no-explicit-any
export type AnyClass = { new(...args: any[]): any }
