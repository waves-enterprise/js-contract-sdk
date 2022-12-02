/* eslint-disable no-console */
import { exec } from 'child_process'
import { NetworkInterfaceInfo, networkInterfaces } from 'os'
import { broadcast, getContractDeveloper, getParticipants } from './utils'
import { CallContractTx, CreateContractTx } from '@wavesenterprise/voting-blockchain-tools/transactions'
import { CONTRACT_NAME, NODE_ADDRESS } from './config'
import * as path from 'path'
import { WaitTransactionMining } from '@wavesenterprise/voting-contract-api'
import axios from 'axios'

const contractName = CONTRACT_NAME.toLowerCase()

function getLocalHostNetworkIp() {
  const network = networkInterfaces()
  for (const key in network) {
    for (const net of (network[key] as NetworkInterfaceInfo[])) {
      if (net.address.includes('192.168.')) {
        return net.address
      }
    }
  }
  throw new Error('Local network ip was not found')
}

const imageName = `localhost:5000/${contractName}`
const ip = getLocalHostNetworkIp()

const execute = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout)
      }
    })
  })
}

const run = async () => {
  console.log('Building sdk')
  await execute(`npm --prefix ${path.resolve(__dirname, '..', '..', 'packages', 'contract-core')} run build`)
  console.log(`Building docker image, debug=1, host_network=${ip}`)
  const buildCommand =
    // eslint-disable-next-line max-len
    `docker build --build-arg DEBUG=1 --build-arg REMOTE_LOG=1 --build-arg HOST_NETWORK=${ip} -t ${contractName} -f sandbox.Dockerfile ../../`
  console.log(buildCommand)
  await execute(buildCommand)
  console.log('Done building')
  await execute(`docker image tag ${contractName} ${imageName}`)
  console.log('Tagged')
  console.log(`Start pushing to repo ${imageName}`)
  await execute(`docker push ${imageName}`)
  console.log('Done pushing')
  const inspectResult = await execute(`docker inspect ${imageName}`)
  const inspectData = JSON.parse(inspectResult)[0]
  const imageHash = inspectData.Id.replace('sha256:', '')
  console.log(`New image hash is ${imageHash}`)

  const developerKeys = await getContractDeveloper()
  const result = await broadcast(new CreateContractTx({
    contractName: CONTRACT_NAME,
    image: imageName,
    imageHash,
    fee: 0,
    senderPublicKey: developerKeys.publicKey,
    apiVersion: '1.0',
    validationPolicy: {
      type: 'any',
    },
    params: [
      {
        key: 'initial',
        type: 'integer',
        value: 10,
      },
      {
        key: 'nonce',
        type: 'string',
        value: 'nonce',
      },
      {
        key: 'invisible',
        type: 'boolean',
        value: false,
      },
    ],
  }), developerKeys)

  console.log(`Contract id ${result.id}`)

  const waiter = new WaitTransactionMining(
    NODE_ADDRESS,
    axios,
    100000,
    2,
    result.id,
  )

  console.log('Waiting create contract mining')
  await waiter.waitMining()
  console.log('Create tx mined')

  const participants = await getParticipants()
  await Promise.all(participants.slice(0, 20).map((p) => {
    return broadcast(new CallContractTx({
      fee: 0,
      senderPublicKey: p.publicKey,
      params: [
        {
          key: 'action',
          value: 'increment',
          type: 'string',
        },
        {
          key: 'by',
          value: Math.trunc(Math.random() * 10) + 1,
          type: 'integer',
        },
      ],
      contractId: result.id,
      contractVersion: 1,
    }), p)
  }))
  console.log('All tx`s sent')

}

run().catch(console.error)
