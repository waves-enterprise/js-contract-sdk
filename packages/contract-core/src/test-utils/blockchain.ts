import {Constructable} from '../intefaces/helpers'
import {Contract} from "./example/test-wrapper";
import {OpenedContract} from "./contract-wrapper";
import {LocalGrpcClient} from "./environment/local";
import {Executor} from "./executor";
import {IBlockchainState, LocalAssets, LocalContractState} from "./environment/local-contract-state";
import Long from 'long'
import {LocalContractProcessor} from "./environment/local-contract-processor";

export type ContractExecutable = any
export type Account = string

export class Blockchain {
  contracts = new WeakMap<Constructable<ContractExecutable>, IBlockchainState>()
  balances = new LocalAssets()

  fundAccount(account: Account, value: number) {
    this.balances.transfer('__root', account, Long.fromNumber(value))
  }

  deployContract(c: Constructable<ContractExecutable>, initState?: IBlockchainState): string {
    const state = initState ?? new LocalContractState()

    this.contracts.set(c, state)

    return c.name
  }

  connect<T extends Contract>(t: T): OpenedContract<T> {
    const executor = new Executor(t.targetExecutable)
    const contractState = this.contracts.get(t.targetExecutable)

    if (!contractState) {
      throw new Error("contract not deployed")
    }

    const processor = new LocalContractProcessor(
      t.targetExecutable,
      new LocalGrpcClient(contractState, this.balances, t.targetExecutable.name)
    );

    executor.setProcessor(processor)

    return new Proxy<any>(t as any, {
      get: (target, prop) => {
        const value = target[prop];

        if (prop == 'getKey') {
          return (...args: any[]) => contractState.getKeys(args)[0];
        }

        if (typeof prop === 'string' && (prop.startsWith('get') || prop.startsWith('invoke'))) {
          if (typeof value === 'function') {
            return (...args: any[]) => value.apply(target, [executor, ...args]);
          }
        }
        return value;
      }
    }) as OpenedContract<T>;
  }

  getBalance(address: string) {
    return this.balances.getBalance(address)
  }
}