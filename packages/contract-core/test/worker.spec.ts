import 'reflect-metadata'
import {ContractProcessor} from '../src/execution/contract-processor'
import {ContractClient, RPC} from "../src/grpc";
import {
  ContractKeysRequest, ContractTransaction,
  ContractTransactionResponse, CreateContractTransactionData
} from "@wavesenterprise/js-contract-grpc-client/contract/contract_contract_service";
import {StaticPool} from "../src/utils/workers/static-pool";
import {ContractTransferIn} from "@wavesenterprise/js-contract-grpc-client/contract_transfer_in";


jest.spyOn(RPC.prototype, 'Contract', 'get')
  .mockReturnValue({
    connect() {
    },
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
  } as unknown as ContractClient)


function mockAction(name: string) {
  return ContractTransactionResponse.fromPartial({
    authToken: 'test-token',
    transaction: ContractTransaction.fromPartial({
      id: 'some-tx-id',
      type: 104,
      sender: 'iam',
      senderPublicKey: 'mypc',
      contractId: 'test-contract',
      params: [
        {
          stringValue: name,
          key: 'action',
        },
      ],
      fee: 100, // todo long
      version: 5,
      proofs: new Uint8Array(),
      timestamp: new Date().getTime(),
      feeAssetId: {
        value: 'WAVES',
      },
      payments: [
        ContractTransferIn.fromPartial({
          amount: 1000000,
        }),
        ContractTransferIn.fromPartial({
          amount: 1000000,
          assetId: 'assetId',
        }),
      ],
    }),
  })
}

const response = ContractTransactionResponse
  .fromPartial(
    {
      "authToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE2NjgwNzI3MjQsImlhdCI6MTY2ODA3MjY2NCwidHhJZCI6IjhHOUdES29keW5TeUQ2M1k4MU5QZ0JSc0FLUFNnVHUzaVNWYjk4dXNwaEVXIiwiY29udHJhY3RJZCI6IjhHOUdES29keW5TeUQ2M1k4MU5QZ0JSc0FLUFNnVHUzaVNWYjk4dXNwaEVXIiwiZXhlY3V0aW9uSWQiOiI0MSJ9.oCH4UGGZPozNjinhos13yUqFING-ZVvXcfKNZSbCZZDiNv4UmLQozVIFhY0G4HoES-C2dh9fzGTEzg7BZlTEDOjGctzCtO40cxkVhxw4DIwx5FSxFSvxp5CdekvUVx5b_qmN1xfMHrrG7IYsvbKF0vb3uM62DzJvNEZcy9DiyHCE0QgTRDchMj-kVp-X9lGj0t8LqDBECVWXUGW_VCsYcy2mATdrjPQufYy1CAl5NY8ZgMI0Pk3jcwaqBJiK5aReLdHVB1OBrvO4gUrgcKbeGiZz6kyfQxqG2jP9PmxZTY5exm-dvuL4wKJTasS8wP7Dpk0VHFRYEaxnHwTUkh0uMA",
      transaction: {
        "id": "8G9GDKodynSyD63Y81NPgBRsAKPSgTu3iSVb98usphEW",
        "type": 103,
        "sender": "3NhCzjv9RVbvVKWXYU6JxcjUVJCKLPRb9si",
        "senderPublicKey": "FfwfXaYY6o9Gtp7YbkSPuJPZT7bgNLkNiQtY62Tm2RvQ",
        "contractId": "8G9GDKodynSyD63Y81NPgBRsAKPSgTu3iSVb98usphEW",
        "params": [
          {"key": "asset0", "stringValue": "LKCKT4G3TH4oG3o3hLLajvgjebArZSH5VNGfqQEZ3jD"},
          {"key": "asset1", "stringValue": "Ezie3QfV6R2nX3JnukJhxGUZUSaxHhDs7UJwQJQ9BUXU"},
          {"key": "feeRate", "intValue": "30000"}
        ],
        "fee": '0',
        "version": 5,
        "proofs": new Uint8Array([1, 2, 3]),
        "timestamp": '1625333091',
        "payments": [],
        "createData": CreateContractTransactionData.fromJSON({
          "image": "amm-example:latest",
          "imageHash": "4511182c74bf2a899b66d69996679adeff02be7429be5ff116c3ca5228ccce61",
          "contractName": "HabrAMM"
        })
      }
    }
  )


describe('ContractProcessor', () => {

  it('should execute test action successfully', async function () {
    const pool = new StaticPool({
      size: 2,
      task: './test/worker.js',
      contractPath: './fixtures/contract.js',
    })

    await pool.workersReady

    await pool.runTask({
      authToken: response.authToken,
      tx: ContractTransaction.toJSON((response.transaction! as ContractTransaction)),
    })

    console.log('ready')
  })
})