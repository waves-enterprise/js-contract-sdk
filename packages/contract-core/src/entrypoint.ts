import { ContractConfig, ContractService } from './execution/contract-service'

function bindProcessHandlers() {
  process.on('SIGINT', async () => {
    try {
      console.log('Graceful shutdown')
      process.exit(0)
    } catch (err) {
      console.log(`Graceful shutdown failure: ${err.message}`)
      process.exit(1)
    }
  })
}

export async function initContract(cfg: ContractConfig) {
  bindProcessHandlers()

  const contractService = new ContractService(cfg)

  try {
    await contractService.start()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}