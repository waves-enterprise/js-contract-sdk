import { mockAction } from './mocks/contract-transaction-response'
import { Action, Assets, AssetsService, AttachedPayments, Contract, ExecutionContext, Payments } from '../src'
import Long from 'long'
import { createContractProcessor } from './mocks/contract-processor'
import { ContractAddressService, ContractService } from '@wavesenterprise/we-node-grpc-api'


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
    async transfers(@Payments payments: AttachedPayments) {

    }

    @Action()
    async balances() {
      const TestAsset = this.assets.getAsset('test')
      await TestAsset.getBalanceOf('me')
      await TestAsset.getBalanceOf()
      console.log('???')
    }
  }

  it('must perform asset manipulations', async () => {
    const tx = mockAction('operations')
    const { processor, success } = createContractProcessor(TestContract)
    const assetId = '123'
    jest.spyOn(AssetsService.prototype, 'calculateAssetId').mockImplementation(() => Promise.resolve(assetId))
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
  })

  it('must receive incoming transfers', async () => {
    const tx = mockAction('transfers')
    const { processor } = createContractProcessor(TestContract)
    const action = jest.spyOn(TestContract.prototype, 'transfers')
    await processor.handleIncomingTx(tx)
    expect(action).toHaveBeenCalledWith([{
      assetId: 'test',
      amount: new Long(10000),
    }])
  })

  it('must request balances', async () => {
    const tx = mockAction('balances')
    const { processor } = createContractProcessor(TestContract)
    const addressService = jest.spyOn(ContractAddressService.prototype, 'getAssetBalance')
      .mockImplementation(() => Promise.resolve({
        assetId: new Uint8Array(),
        amount: new Long(1000),
        decimals: 8,
      }))
    const contractService = jest.spyOn(ContractService.prototype, 'getContractBalances')
      .mockImplementation(() => Promise.resolve([{
        assetId: '',
        amount: new Long(1000),
        decimals: 8,
      }]))
    await processor.handleIncomingTx(tx)
    expect(contractService).toHaveBeenCalledTimes(1)
    expect(addressService).toHaveBeenCalledTimes(1)
  })

})
