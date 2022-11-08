import { ExecutionContext } from './execution-context'
import { getArgsMetadata, getContractMetadata } from './reflect'
import { TArgs, TContractActionMetadata } from '../api/meta'
import { isPrimitive, isWrappedType } from '../utils'
import { Constructable } from '../@types/common'
import { ReservedParamNames, TxId } from './constants'
import {
  ContractError,
  UnavailableContractActionException,
  UnavailableContractParamException,
  UnexpectedParamTypeException,
} from './exceptions'

function getArgKey(idx: number) {
  return `arg:${idx}`
}

export class ParamsExtractor {
  extractAction(contract: Constructable<unknown>, executionContext: ExecutionContext) {
    const metadata = getContractMetadata(contract)

    switch (executionContext.tx.type as TxId) {
      case TxId.create:
        return metadata.initializer
      case TxId.call:
        const actionName = executionContext.params.get(ReservedParamNames.action)

        if (!actionName) {
          throw new UnavailableContractParamException(ReservedParamNames.action)
        }

        const actionMetadata = metadata.actions[actionName]

        if (!actionMetadata) {
          throw new UnavailableContractActionException(actionName)
        }

        return actionMetadata
    }
  }

  extract(
    contract: Constructable<unknown>,
    executionContext: ExecutionContext,
  ): { actionMetadata: TContractActionMetadata, args: unknown[] } {
    const actionMetadata = this.extractAction(contract, executionContext)

    const argsMetadata: TArgs = getArgsMetadata(contract, actionMetadata.propertyName)

    const paramTypes = Reflect.getMetadata(
      'design:paramtypes',
      contract.prototype,
      actionMetadata.propertyName,
    ) as unknown[]

    const actionArgs = new Array(paramTypes.length)

    for (const [paramIndex, param] of paramTypes.entries()) {
      const argFromParams = argsMetadata[getArgKey(paramIndex)]

      if (!argFromParams) {
        // try get from container
        // throw new ContractError(`Argument at index ${paramIndex} should be annotated with @Param decorator`)
      } else {
        const paramValue = executionContext.params.get(argFromParams.paramKey)

        if (!paramValue) {
          throw new UnavailableContractParamException(argFromParams.paramKey)
        }


        if (isPrimitive(param)) {
          actionArgs[paramIndex] = paramValue
        } else if (isWrappedType(param)) {
          try {
            actionArgs[paramIndex] = new param(paramValue)
          } catch (e) {
            throw new ContractError(e.message)
          }
        } else {
          throw new UnexpectedParamTypeException(argFromParams.paramKey)
        }
      }
    }

    return {
      actionMetadata,
      args: actionArgs,
    }
  }
}
