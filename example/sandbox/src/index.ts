import { initContract } from '@wavesenterprise/contract-core'

initContract({
  contractPath: __dirname + '/contract.js',
  concurrencyLevel: 8,
})
