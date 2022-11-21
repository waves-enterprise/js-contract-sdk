import { ContractState } from '../state'
import { Container } from '../container'
import { ExecutionContext, IncomingTx, TransferIn } from '../../execution'

export function getExecutionContext(): ExecutionContext {
  return Container.get(ExecutionContext)
}

export function getTx(): IncomingTx {
  return Container.get(ExecutionContext).tx
}

export function getPayments(): TransferIn[] {
  return Container.get(ExecutionContext).tx.payments
}

export function getState(): ContractState {
  return Container.get(ExecutionContext).state
}
