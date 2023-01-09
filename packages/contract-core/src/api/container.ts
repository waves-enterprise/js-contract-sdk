import { Constructable } from '../intefaces/helpers'

export class InjectionToken {
  constructor(public tokenString: string) {
  }
}

const PROVIDER = 'sc:provided'

let counter = 0

export class Container {
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
  static get<T>(token: Constructable<T>): T
  static get(token: unknown): unknown {
    if (token instanceof InjectionToken) {
      return this.container.get(token.tokenString) as unknown
    }

    const constructor = token as Constructable<unknown>

    const instanceKey = Reflect.getMetadata(PROVIDER, constructor)

    return this.container.get(instanceKey) as unknown
  }
}
