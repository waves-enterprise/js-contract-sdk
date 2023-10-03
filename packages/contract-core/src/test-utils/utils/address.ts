import { Keypair } from '@wavesenterprise/signer'

export async function getKeypair(num: number): Promise<Keypair[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Array(num).fill(await Keypair.generate())
}
