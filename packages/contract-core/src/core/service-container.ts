type constructor<T> = {
    new (...args: any[]): T;
};

export class InjectionToken<W = any> {
    constructor(public tokenString: string) {}
}

const PROVIDER = 'sc:provided';

let counter = 0;

export class ServiceContainer {
    private static container = new Map();

    public static set(token: InjectionToken, instance: any): void;
    public static set(instance: any): void;
    static set(...args: any[]) {
        if (args.length === 2) {
            const [token, instance] = args;

            this.container.set((token as InjectionToken).tokenString, instance);
        } else {
            const instance = args[0];

            const instanceKey = 'provided-' + counter;

            counter++;

            Reflect.defineMetadata(PROVIDER, instanceKey, instance.constructor);

            this.container.set(instanceKey, instance);
        }
    }

    public static get<P>(token: InjectionToken<P>): P;
    public static get<T>(token: constructor<T>): T;
    static get(token: any): any {
        if (token instanceof InjectionToken) {
            return this.container.get(token.tokenString);
        }

        const constructor = token as constructor<any>;

        const instanceKey = Reflect.getMetadata(PROVIDER, constructor);

        return this.container.get(instanceKey);
    }
}
