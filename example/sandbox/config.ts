import { Env } from '@wavesenterprise/env-extractor'
import { config } from 'dotenv'

config()

export const NODE_ADDRESS = Env.string('NODE_ADDRESS').required().get()
export const NODE_BLOCKCHAIN_ADDRESS = Env.string('NODE_BLOCKCHAIN_ADDRESS').required().get()
export const NODE_KEYPAIR_PASSWORD = Env.string('NODE_KEYPAIR_PASSWORD').required().get()
export const NODE_API_KEY = Env.string('NODE_API_KEY').required().get()
export const CONTRACT_NAME = Env.string('CONTRACT_NAME').default('TEST_CONTRACT').get()
