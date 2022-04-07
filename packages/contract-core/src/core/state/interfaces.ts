export interface IStateReader<K = string, R = any> {
    readOne(key: string): void
}


export interface IStateWriter<K = string, R = any> {
    write(key: string, value: string): void;
}
