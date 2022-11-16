import {ContractClient, RPC, RPCConnectionConfig} from "../src/grpc";
import {
  AssetId,
  CalculateAssetIdRequest,
  ContractKeysRequest,
  ContractTransaction
} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractProcessor} from "../src/execution/contract-processor";
import {mockRespTx} from "./mocks/contract-transaction-response";
import {Action, Contract,Asset} from "../src";
import {getExecutionContext} from "../src/api/decorators/common";

jest.spyOn(RPC.prototype, 'Contract', 'get')
  .mockReturnValue({
    setAuth() {
    },
    commitExecutionSuccess: jest.fn((args) => {
      // console.log(args)
    }),
    commitExecutionError: jest.fn((args) => {
      // console.log(args)
    }),
    getContractKeys: jest.fn((req: ContractKeysRequest) => {

    }),
    getContractKey: jest.fn((args) => {
      // console.log(args)
    }),

    calculateAssetId: jest.fn((args) => {
      console.log(args)


      return AssetId.fromPartial({
        value: 'test-x'
      })
    })
  } as unknown as ContractClient)


jest.spyOn(ContractProcessor.prototype, 'tryCommitError')
jest.spyOn(RPC.prototype, 'saveClient')
  .mockImplementation(() => {
  })


describe("Asset Operations", () => {
  const rpc = new RPC({} as unknown as RPCConnectionConfig)

  @Contract()
  class TestContract {
    @Action
    async test() {
      const TestAsset = await Asset.new()

      TestAsset.issue(
        'Habr/Rbah-LP',
        'HabrAMM Habr/Rbah LP Shares',
        1000000,
        8,
        true
      )


      TestAsset.transfer('me', 1000)
     console.log( getExecutionContext().assetOperations.operations)
    }
  }


  it('should preload keys in a batch request', async function () {
    const resp = mockRespTx('test')

    const processor = new ContractProcessor(
      TestContract,
      rpc,
    )

    await processor.handleIncomingTx({authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!)})
  })

})
