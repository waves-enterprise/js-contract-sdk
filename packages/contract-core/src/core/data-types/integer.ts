import BN from 'bn.js'
import Long from 'long'

export class TInt extends BN {
  static fromLong(t: Long) {
    return new TInt(t.toString())
  }
}