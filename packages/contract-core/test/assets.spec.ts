import {ContractClient, RPC, RPCConnectionConfig} from "../src/grpc";
import {
  AssetId,
  CalculateAssetIdRequest, ContractBalanceResponse, ContractBalancesRequest, ContractBalancesResponse,
  ContractKeysRequest,
  ContractTransaction
} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {ContractProcessor} from "../src/execution/contract-processor";
import {mockRespTx} from "./mocks/contract-transaction-response";
import {Action, Contract,Asset} from "../src";

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

    getContractBalances(req: ContractBalancesRequest): Promise<ContractBalancesResponse> {
      return  Promise.resolve(ContractBalancesResponse.fromPartial({
        assetsBalances: [
          ContractBalanceResponse.fromPartial({
            assetId: 'mockAssetId',
            amount: 10000000,
          })
        ]
      }))
    },

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


  it('should call getBalances contract rpc', async function () {
    @Contract()
    class TestingContract {

      @Action()
      async assetBalance() {
        const resp =  await Asset.balanceOf('mockAddress');
      }
    }

    const resp = mockRespTx('assetBalance')

    const processor = new ContractProcessor(
      TestingContract,
      rpc,
    )

    await processor.handleIncomingTx({authToken: 'test', tx: ContractTransaction.toJSON(resp.transaction!)})
  })

})
