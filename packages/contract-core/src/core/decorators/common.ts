import { ServiceContainer } from '../common'
import { ExecutionContext } from '../execution/execution-context'
import { ContractState } from '../state'

export function getExecutionContext(): ExecutionContext {
  return ServiceContainer.get(ExecutionContext)
}

export function getState(): ContractState {
  return ServiceContainer.get(ExecutionContext).state
}