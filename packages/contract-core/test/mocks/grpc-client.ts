import { GrpcClient } from '../../src/grpc/grpc-client'

export const createGrpcClient = () => {
  return new GrpcClient({
    nodeAddress: 'localhost:3000',
    connectionToken: '',
  })
}
