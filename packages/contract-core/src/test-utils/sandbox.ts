import { Constructable } from '../intefaces/helpers'
import { Contract } from './example/test-wrapper'
import { Account, ContractExecutable, OpenedContract } from './types'
import { LocalGrpcClient } from './environment/local'
import { Executor } from './executor'
import { IBlockchainState, LocalAssets, LocalContractState } from './environment/local-contract-state'
import { LocalContractProcessor } from './environment/local-contract-processor'
import { Keypair } from '@wavesenterprise/signer'
import { ContractIssue } from '@wavesenterprise/we-node-grpc-api'
import { randomUint8Array, toBase58 } from '@wavesenterprise/crypto-utils'
import Long from 'long'

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export class Sandbox {
  contractStates = new Map<string, IBlockchainState>()
  contractExecutables = new Map<string, Constructable<ContractExecutable>>()

  contracts = new WeakMap<Constructable<ContractExecutable>, IBlockchainState>()

  balances = new LocalAssets()

  issueAsset({ assetId, nonce = 0, ...request }: PartialBy<ContractIssue, 'assetId' | 'nonce'>): string {
    if (!assetId) {

      assetId = toBase58(randomUint8Array(32))
    }

    this.balances.issue({ assetId, nonce, ...request }, '__root')
    this.balances.addBalance(assetId, '__root', request.quantity)

    return assetId
  }

  fundAccount(recipient: Account, value: number, assetId?: string) {
    this.balances.transfer('__root', recipient, Long.fromNumber(value), assetId)
  }

  deployContract(c: Constructable<ContractExecutable>, initState?: IBlockchainState): string {
    const state = initState ?? new LocalContractState()

    // TODO emulate init transaction
    const txId = toBase58(randomUint8Array(32))

    this.contractExecutables.set(txId, c)
    this.contractStates.set(txId, state)

    return txId
  }

  connect<T extends Contract>(t: T): OpenedContract<T> {
    const executor = new Executor(t.targetExecutable)
    const contractState = this.contractStates.get(t.address)

    if (!contractState) {
      throw new Error('contract not deployed')
    }

    const processor = new LocalContractProcessor(
      t.targetExecutable,
      new LocalGrpcClient(contractState, this.balances, t.address),
    )

    executor.setProcessor(processor)

    return new Proxy<any>(t as any, {
      get: (target, prop, receiver) => {
        const value: unknown = target[prop]

        switch (prop) {
          case 'getKey':
            return (...args: any[]) => contractState.getKeys(args)[0]
          case 'as':
            return (kp: Keypair) => {
              executor.setSender(kp)

              return receiver
            }
          default:
            if (typeof prop === 'string' && (prop.startsWith('get') || prop.startsWith('invoke'))) {
              if (typeof value === 'function') {
                return (...args: any[]) => value.apply(target, [executor, ...args])
              }
            }

            return value
        }
      },
    }) as OpenedContract<T>
  }

  getBalance(address: string, assetId?: string) {
    return this.balances.getBalance(address, assetId)
  }
}
