import { ContractProcessor } from '../src/execution/contract-processor'
import { mockAction } from './mocks/contract-transaction-response'
import { Action, Assets, AssetsService, Contract, ExecutionContext } from '../src'
import Long from 'long'
import { createGrpcClient } from './mocks/grpc-client'


describe('Asset Operations', () => {

  @Contract()
  class TestContract {

    @Assets()
    assets!: AssetsService

    @Action()
    async operations() {

      const TestAsset = await this.assets.issueAsset({
        name: 'Habr/Rbah-LP',
        description: 'HabrAMM Habr/Rbah LP Shares',
        decimals: 8,
        quantity: new Long(1000000),
        isReissuable: true,
      })

      TestAsset.transfer({
        amount: new Long(1000),
        recipient: 'me',
      })

      TestAsset.burn({
        amount: new Long(2000),
      })

      TestAsset.reissue({
        isReissuable: true,
        quantity: new Long(3000),
      })
    }

    @Action()
    async transfers() {

    }
  }

  it('must perform asset manipulations', async () => {
    const tx = mockAction('operations')
    const processor = new ContractProcessor(TestContract, createGrpcClient())
    const success = jest.spyOn(processor, 'tryCommitSuccess')
    const error = jest.spyOn(processor, 'tryCommitError')
    const assetId = '123'
    jest.spyOn(AssetsService.prototype, 'calculateAssetId').mockImplementation(() => Promise.resolve(assetId))
    success.mockImplementation(() => Promise.resolve())
    error.mockImplementation((...args) => {
      console.log('error', args)
      return Promise.resolve()
    })
    await processor.handleIncomingTx(tx)
    const resultContext = success.mock.calls[0][0] as ExecutionContext
    expect(resultContext.assets.getOperations()).toEqual([
      {
        contractIssue: {
          assetId,
          nonce: 1,
          name: 'Habr/Rbah-LP',
          description: 'HabrAMM Habr/Rbah LP Shares',
          decimals: 8,
          quantity: new Long(1000000),
          isReissuable: true,
        },
      },
      {
        contractTransferOut: {
          assetId,
          recipient: 'me',
          amount: new Long(1000),
        },
      },
      {
        contractBurn: {
          assetId,
          amount: new Long(2000),
        },
      },
      {
        contractReissue: {
          assetId,
          isReissuable: true,
          quantity: new Long(3000),
        },
      },
    ])
    expect(error).not.toHaveBeenCalled()
  })

  it('must receive incoming transfers', async () => {

  })

  it('must request balances', async () => {

  })

})
