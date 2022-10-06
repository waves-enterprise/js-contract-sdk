/* eslint-disable no-console */
import { Kernel } from './handlers/kernel'

export async function start(contractPath: string) {
  try {
    await new Kernel({ contractPath }).start()

    process.on('SIGINT', () => {
      try {
        console.log('Graceful shutdown')
        process.exit(0)
      } catch (err) {
        console.log(`Graceful shutdown failure: ${err.message}`)
        process.exit(1)
      }
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
