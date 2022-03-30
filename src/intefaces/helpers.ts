export type Constructable<T> = {
    new(...args: any[]): T;
};


export type TypeOf<R> = R extends { new(...args: any): infer Z } ? Z : never;
