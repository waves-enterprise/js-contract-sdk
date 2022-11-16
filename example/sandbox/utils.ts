import axios from 'axios'
import { NODE_ADDRESS, NODE_API_KEY, NODE_BLOCKCHAIN_ADDRESS, NODE_KEYPAIR_PASSWORD } from './config'
/* eslint-disable */
import { resolve } from 'path'
import { constants as fsConstants, promises as fs } from 'fs'
import { WavesNodeCrypto } from '@wavesenterprise/voting-blockchain-tools/node/seed/waves'
import { SeedManager } from '@wavesenterprise/voting-blockchain-tools/node/seed/common'
import { GostCrypto } from '@wavesenterprise/voting-blockchain-tools/node/seed/gost'
import { KeyPair, TransactionBroadcaster } from '@wavesenterprise/voting-blockchain-tools/transactions'
import { WavesSignature } from '@wavesenterprise/voting-blockchain-tools/node/signature/waves'
import { GostSignature } from '@wavesenterprise/voting-blockchain-tools/node/signature/gost'

export type NodeConfig = {
  additionalFee: { [key: string]: number },
  minimumFee: { [key: string]: number },
  gostCrypto: boolean,
  chainId: string,
}

let nodeConfig: NodeConfig

export const getNodeConfig = async (): Promise<NodeConfig> => {
  if (nodeConfig) {
    return nodeConfig
  }
  try {
    const { data } = await axios.get<NodeConfig>(`${NODE_ADDRESS}/node/config`)
    nodeConfig = data
    return data
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('failed to get node config', (e as Error).message)
    process.exit(1)
  }
}

export const checkFileExists = async (path: string) => {
  try {
    await fs.access(path, fsConstants.F_OK)
    return true
  } catch (e) {
    return false
  }
}

export const readJsonFile = async <T = unknown>(path: string): Promise<T> => {
  try {
    const data = await fs.readFile(path)
    return JSON.parse(data.toString())
  } catch (e) {
    if (isError(e)) {
      throw new Error(`Failed to read json file ${path} ${e.message}`)
    }
    throw e
  }
}

export function isError<T extends new(...args: any[]) => unknown = ErrorConstructor>(
  value: unknown,
  // @ts-ignore
  errorType: T = Error,
): value is InstanceType<T> & NodeJS.ErrnoException {
  // @ts-ignore
  return value instanceof errorType || value.constructor.name === 'Error'
}


export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))


type DeveloperKeyPair = {
  address: string,
  privateKey: string,
  publicKey: string,
}

export async function getContractDeveloper() {
  const nodeConfig = await getNodeConfig()
  const keysFile = resolve(__dirname, 'developer-keys.json')


  const exists = await checkFileExists(keysFile)
  if (exists) {
    return readJsonFile<DeveloperKeyPair>(keysFile)
  }

  const seedManager = new SeedManager({
    networkByte: nodeConfig.chainId.charCodeAt(0),
    keysModule: nodeConfig.gostCrypto ? GostCrypto : WavesNodeCrypto,
  })

  const seed = await seedManager.create()

  const keys = { address: seed.address, ...seed.keyPair }

  try {
    const { data } = await axios.post(`${NODE_ADDRESS}/transactions/signAndBroadcast`, {
      'type': 102,
      'sender': NODE_BLOCKCHAIN_ADDRESS,
      'password': NODE_KEYPAIR_PASSWORD,
      'fee': nodeConfig.minimumFee['102'],
      'proofs': [''],
      'target': keys.address,
      'opType': 'add',
      'role': 'contract_developer',
      'dueTimestamp': null,
    }, {
      headers: {
        'X-Api-Token': NODE_API_KEY,
      },
    })
    console.log('Wait 20s contract role add tx', data.id)
  } catch (e) {
    throw new Error(`failed to append contract developer role ${e.message}`)
  }

  await sleep(20000)

  await fs.writeFile(keysFile, JSON.stringify(keys))

  console.log('Developer keys generated', keys)

  return keys
}

export async function getParticipants() {
  const nodeConfig = await getNodeConfig()
  const keysFile = resolve(__dirname, 'participants.json')

  const exists = await checkFileExists(keysFile)
  if (exists) {
    return readJsonFile<DeveloperKeyPair[]>(keysFile)
  }

  const seedManager = new SeedManager({
    networkByte: nodeConfig.chainId.charCodeAt(0),
    keysModule: nodeConfig.gostCrypto ? GostCrypto : WavesNodeCrypto,
  })

  const keys = await Promise.all(Array(1000).fill(undefined).map(async () => {
    const seed = await seedManager.create()
    return { address: seed.address, ...seed.keyPair }
  }))
  await fs.writeFile(keysFile, JSON.stringify(keys))
  return keys
}


export const broadcast = async (tx, keys: KeyPair) => {
  const nodeConfig = await getNodeConfig()
  const broadcaster = new TransactionBroadcaster({
    networkByte: nodeConfig.chainId.charCodeAt(0),
    signModule: nodeConfig.gostCrypto ? GostSignature : WavesSignature,
    nodeAddress: NODE_ADDRESS,
    axiosInstance: axios,
  })
  return broadcaster.broadcast(tx, keys)
}
