type constructor<T> = new (...args: any[]) => T

export class InjectionToken {
  constructor(public tokenString: string) {}
}

const PROVIDER = 'sc:provided'

let counter = 0

export class ServiceContainer {
  private static container = new Map()
  static set(token: InjectionToken, instance: unknown): void
  static set(instance: unknown): void
  static set(...args: any[]) {
    if (args.length === 2) {
      const [token, instance] = args

      this.container.set((token as InjectionToken).tokenString, instance)
    } else {
      const instance = args[0]

      const instanceKey = 'provided-' + counter

      counter++

      Reflect.defineMetadata(PROVIDER, instanceKey, instance.constructor)

      this.container.set(instanceKey, instance)
    }
  }

  static get<P>(token: InjectionToken): P
  static get<T>(token: constructor<T>): T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static get(token: unknown): any {
    if (token instanceof InjectionToken) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.container.get(token.tokenString)
    }

    const constructor = token as constructor<unknown>

    const instanceKey = Reflect.getMetadata(PROVIDER, constructor)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.container.get(instanceKey)
  }
}
