import { Keypair } from '@wavesenterprise/signer'

export async function getKeypair(num: number): Promise<Keypair[]> {
  return Array(num).fill(await Keypair.generate())
}
