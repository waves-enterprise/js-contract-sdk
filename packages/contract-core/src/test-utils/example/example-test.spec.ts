import 'reflect-metadata'

import {Sandbox} from "../sandbox";
import {Action, Assets, AssetsService, ContractMapping, ContractState, JsonVar, Param, State, Tx, Var} from "../../api";
import {Test} from "./test-wrapper";
import {OpenedContract} from "../types";
import {IncomingTx} from "../../execution";
import Long from "long";
import {getKeypair} from "../utils/address";
import {Keypair} from "@wavesenterprise/signer";

type DepositRequest = {
  id: string;
  status: 'pending' | 'done' | 'rejected';

  targetAddress: string;

  doneTxId?: string;
  rejectTxId?: string;

  amount: string;
  assetId: string;
}

class Transborder {
  @State state: ContractState
  @Assets() assets: AssetsService;

  @JsonVar({key: 'REQUEST'})
  depositRequests: ContractMapping<DepositRequest>

  @Var({key: "ASSET_NAME"})
  assetNameToId: ContractMapping<string>

  @Var({key: "ASSET"})
  assetIdToName: ContractMapping<string>

  @Action
  async mintBankCheques(
    @Param('amount') amount: Long,
    @Param('assetName') assetName: string,
  ) {
    const asset = await this.assets.issueAsset({
      decimals: 8,
      description: `BANK_${assetName}`,
      isReissuable: true,
      name: assetName.toUpperCase(),
      quantity: Long.fromNumber(1000 * 10e7),
    })

    this.assetIdToName.set(asset.getId()!, assetName)
    this.assetNameToId.set(assetName, asset.getId()!)
  }

  @Action
  async requestDeposit(
    @Tx() tx: IncomingTx,
    @Param('amount') amount: Long,
    @Param('assetId') assetId: string,
    @Param('targetAddress') address: string,
  ) {
    const request: DepositRequest = {
      id: tx.id,
      status: 'pending',
      assetId,
      targetAddress: address,
      amount: amount.toString()
    }

    this.depositRequests.set(tx.id, request)
  }

  @Action
  async confirmDeposit(
    @Tx() tx: IncomingTx,
    @Param('requestId') requestId: string,
  ) {
    const request = await this.depositRequests.get(requestId)

    if (request.status !== 'pending') {
      throw new Error('request should be pending')
    }

    this.assets.reissueAsset(request.assetId, {
      isReissuable: true,
      quantity: Long.fromString(request.amount)
    });

    this.assets.transferAsset(request.assetId, {
      recipient: request.targetAddress,
      amount: Long.fromString(request.amount)
    });

    request.status = 'done'
    request.doneTxId = tx.id;

    this.depositRequests.set(request.id, request)
  }


  @Action()
  rejectDeposit() {
    throw new Error('not implemented')
  }
}

describe('Transborder', () => {
  let blockchain: Sandbox;
  let contract: OpenedContract<Test>

  let bank: Keypair, client: Keypair
  let WRUB: string, WUSDT: string

  beforeAll(async () => {
    [bank, client] = await getKeypair(2)

    blockchain = new Sandbox();

    const contractId = blockchain.deployContract(Transborder);
    contract = blockchain.connect(Test.createFromAddress(contractId, Transborder));

    blockchain.fundAccount(await bank.address(), 10000);
    blockchain.fundAccount(await client.address(), 10000);

    WUSDT = blockchain.issueAsset({
      name: "WUSDT",
      description: "WUSDT",
      decimals: 8,
      isReissuable: true,
      quantity: Long.fromNumber(2_000_000 * 10e7)
    })

    WRUB = blockchain.issueAsset({
      name: "WRUB",
      description: "WRUB",
      decimals: 8,
      isReissuable: true,
      quantity: Long.fromNumber(2_000_000 * 10e7)
    })


    blockchain.fundAccount(contractId, 1_000_000 * 10e7, WUSDT)
    blockchain.fundAccount(contractId, 1_000_000 * 10e7, WRUB)
  })

  it('should create deposit request', async function () {
    const depositAmount = 100 * 10e7

    const requestTxId = await contract.as(bank).invokeRequestDeposit(depositAmount, WUSDT, await client.address())
    const requestString = await contract.getKey(`REQUEST_${requestTxId}`)

    expect(requestString).not.toBeUndefined()

    const res = JSON.parse(requestString as string) as DepositRequest

    expect(res.status).toBe('pending')
    expect(res.id).toBe(requestTxId)
    expect(res.amount).toBe(String(depositAmount))

    const confirmTxId = await contract.as(bank).invokeConfirmDeposit(requestTxId)
    const requestAfterConfirmString = await contract.getKey(`REQUEST_${requestTxId}`)

    expect(requestAfterConfirmString).not.toBeUndefined()

    const resAfterConfirm = JSON.parse(requestAfterConfirmString as string) as DepositRequest

    expect(resAfterConfirm.status).toBe('done')
    expect(resAfterConfirm.doneTxId).toBe(confirmTxId)

    const balanceAfter = blockchain.getBalance(await client.address(), WUSDT)
    const contractBalanceAfter = blockchain.getBalance(contract.address, WUSDT)

    expect(balanceAfter.toString()).toBe(String(depositAmount))
    expect(contractBalanceAfter.toString()).toBe(String((1_000_000 * 10e7) - depositAmount))
  });
})
