import { ContractState } from '../contract-state'
import { TVarConfig } from '../../decorators/var'
import { TValue } from '../../../intefaces/contract'
import { ContractError } from '../../../execution'

export class ContractValue<Deserialized extends unknown> {

  constructor(
    private readonly state: ContractState,
    private readonly config: TVarConfig,
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

  get(): Promise<Deserialized> {
    return this.state.get(this.config.key, this.config.contractId)
      .then((value) => this.deserialize(value))
  }

  set(value: Deserialized) {
    if (this.config.contractId) {
      throw new ContractError(`Attempt to set external contract value of ${this.config.key}`)
    }
    if (this.config.readonly) {
      throw new ContractError(`Attempt to set readonly value of key ${this.config.key}`)
    }
    this.state.set(this.config.key, this.serialize(value))
  }
}
