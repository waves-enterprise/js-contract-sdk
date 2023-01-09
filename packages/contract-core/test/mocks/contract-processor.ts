import { ContractProcessor } from '../../src/execution/contract-processor'
import { createGrpcClient } from './grpc-client'

export const createContractProcessor = (contract: unknown) => {
  const processor = new ContractProcessor(contract, createGrpcClient())
  const success = jest.spyOn(processor, 'tryCommitSuccess')
  const error = jest.spyOn(processor, 'tryCommitError')
  success.mockImplementation(() => Promise.resolve())
  error.mockImplementation((...args) => {
    // eslint-disable-next-line no-console
    console.log('error', args)
    return Promise.resolve()
  })
  return { processor, success, error }
}
