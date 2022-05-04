export type Constructable<T> = {
    new(...args: any[]): T;
};


export type Optional<T> = T | undefined;