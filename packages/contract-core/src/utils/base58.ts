const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const ALPHABET_MAP = ALPHABET.split('').reduce((res: Record<string, number>, c, i) => {
  res[c] = i
  return res
}, {})


export class Base58 {
  static encode(buffer: Uint8Array | number[]): string {
    if (!buffer.length) {return ''}

    const digits = [0]

    for (const buf of buffer) {
      for (let j = 0; j < digits.length; j++) {
        digits[j] <<= 8
      }

      digits[0] += buf
      let carry = 0

      for (let k = 0; k < digits.length; k++) {
        digits[k] += carry
        carry = (digits[k] / 58) | 0
        digits[k] %= 58
      }

      while (carry) {
        digits.push(carry % 58)
        carry = (carry / 58) | 0
      }

    }

    for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) {
      digits.push(0)
    }

    return digits.reverse().map(function (digit) {
      return ALPHABET[digit]
    }).join('')

  }

  static decode(str = ''): Uint8Array {
    if (!str.length) {return new Uint8Array(0)}

    const bytes = [0]

    for (const letter of str) {
      if (!(letter in ALPHABET_MAP)) {
        throw new Error(`There is no character "${letter}" in the Base58 sequence!`)
      }

      for (let j = 0; j < bytes.length; j++) {
        bytes[j] *= 58
      }

      bytes[0] += ALPHABET_MAP[letter]
      let carry = 0

      for (let j = 0; j < bytes.length; j++) {
        bytes[j] += carry
        carry = bytes[j] >> 8
        bytes[j] &= 0xff
      }

      while (carry) {
        bytes.push(carry & 0xff)
        carry >>= 8
      }

    }

    for (let i = 0; str[i] === '1' && i < str.length - 1; i++) {
      bytes.push(0)
    }

    return new Uint8Array(bytes.reverse())
  }
}
