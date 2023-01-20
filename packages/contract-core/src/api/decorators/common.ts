import { ContractState } from '../state'
import { Container } from '../container'
import { BlockInfo, ExecutionContext, IncomingTx, TransferIn } from '../../execution'

export function getExecutionContext(): ExecutionContext {
  return Container.get(ExecutionContext)
}

export function getTx(): IncomingTx {
  return getExecutionContext().tx
}

export function getPayments(): TransferIn[] {
  return getTx().payments
}

export function getState(): ContractState {
  return getExecutionContext().state
}

export function getSender(): string {
  return getTx().sender
}

export function getBlock(): BlockInfo {
  return getExecutionContext().blockInfo
}

export function getTime(): number {
  return getBlock().timestamp
}
