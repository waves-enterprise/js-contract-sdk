import { ContractState } from '../state'
import { Container } from '../container'
import { ExecutionContext } from '../../execution'

export function getExecutionContext(): ExecutionContext {
  return Container.get(ExecutionContext)
}

export function getState(): ContractState {
  return Container.get(ExecutionContext).state
}