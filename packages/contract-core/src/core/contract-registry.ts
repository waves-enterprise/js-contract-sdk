import { Constructable } from '../intefaces/helpers'

export class ContractRegistry {
    private static contractsMap = new Map<string, Constructable<unknown>>()

    static add<T>(component: string, target: Constructable<T>): void
    static add<T>(target: Constructable<T>): void
    static add(...args) {
      let component; let target

      if (typeof args[0] === 'string') {
        component = args[0]
        target = args[1]
      } else {
        component = (args[1] as Constructable<unknown>).prototype
        target = args[1]
      }

      this.contractsMap.set(component, target)
    }

    static getDefault() {
      return this.contractsMap.get('default')
    }
}
