import { Constructable } from '../../../intefaces/helpers'
import { ExecutionContext } from '../execution-context'
import { TArgs } from '../../decorators/param'
import { getArgsMetadata } from '../../reflect/getContractMetadata'
import { TContractActionMetadata } from '../../decorators/action'
import { isPrimitive, isWrappedType } from '../../../utils'
import { ContractError, UnavailableContractParamException } from '../../exceptions'
import { TInt } from '../../data-types/integer'

function getArgKey(idx: number) {
  return `arg:${idx}`
}

export class ContractActionArgumentsExtractor {
  extract(
    contract: Constructable<unknown>,
    executionContext: ExecutionContext,
    actionMetadata: TContractActionMetadata,
  ): unknown[] {
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
            actionArgs[paramIndex] = new (param as Constructable<TInt>)(paramValue)
          } catch (e) {
            throw new ContractError(e.message)
          }
        }
      }
      //
      // if (isPrimitive(param)) {
      //     if (!argFromParams) {
      //         throw new ContractError(`Argument at index ${paramIndex} should be annotated with @Param decorator`)
      //     } else {
      //         const param = executionContext.params.get(argFromParams.paramKey)
      //
      //         if (!param) {
      //             throw new UnavailableContractParamException(argFromParams.paramKey)
      //         }
      //
      //         actionArgs[paramIndex] = param
      //     }
      // } else if (isWrappedType(param)) {
      //     const param = executionContext.params.get(argFromParams.paramKey)
      //
      //     if (!param) {
      //         throw new UnavailableContractParamException(argFromParams.paramKey)
      //     }
      // } else {
      //     throw new ContractError(`Type of ${param.name} is not available. string, number, boolean, TInt, BN, Buffer only allowed`)
      // }


      // if (isPrimitive(param)) {
      //     const argAtIndex = Object
      //         .values(argsMetadata)
      //         .find(t => t.index === paramIndex);
      //
      //     if (!argAtIndex) {
      //         throw new Error(`Parameter at index "${paramIndex}" not founded`)
      //     }
      //
      //     actionArgs[paramIndex] = executionContext.params.get(argAtIndex.paramKey);
      // } else {
      //     const resolvedDependency = ServiceContainer.get(param)
      //
      //     if (!resolvedDependency) {
      //         throw new Error(`Action ${actionMetadata.propertyName} Parameter at index "${paramIndex}" not founded. Instance of ${param.name} not provided`)
      //     }
      //
      //     actionArgs[paramIndex] = resolvedDependency;
      // }
    }

    return actionArgs
  }


}