import { TValue } from '../../../intefaces/contract'
import { Optional } from '../../../intefaces/helpers'
import { ContractState } from '../contract-state'
import { TVarConfig } from '../../decorators/var'
import { ContractError } from '../../../execution'

export class ContractMapping<Deserialized extends unknown> {

  constructor(
    protected readonly state: ContractState,
    protected readonly config: TVarConfig,
  ) {
  }

  protected deserialize(value: TValue): Deserialized {
    if (this.config.deserialize) {
      return this.config.deserialize(value) as Deserialized
    }
    return value as unknown as Deserialized
  }

  protected serialize(value: Deserialized): TValue {
    if (this.config.serialize) {
      return this.config.serialize(value) as TValue
    }
    return value as unknown as TValue
  }

  protected composeKey(key: string) {
    if (this.config.key) {
      return `${this.config.key}_${key}`
    }
    return key
  }

  tryGet(key: string): Promise<Optional<Deserialized>> {
    return this.state.tryGet(this.composeKey(key))
      .then((value) => value === undefined ? value : this.deserialize(value))
  }

  get(key: string): Promise<Deserialized> {
    return this.state.get(this.composeKey(key))
      .then((value) => this.deserialize(value))
  }

  set(key: string, value: Deserialized) {
    const composedKey = this.composeKey(key)
    if (this.config.contractId) {
      throw new ContractError(`Attempt to set external contract value of ${composedKey}`)
    }
    if (this.config.readonly) {
      throw new ContractError(`Attempt to set readonly value of key ${composedKey}`)
    }
    this.state.set(composedKey, this.serialize(value))
  }
}
