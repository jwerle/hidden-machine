const {
  crypto_generichash_batch,
  crypto_sign_detached,
  crypto_sign_BYTES,
} = require('sodium-native')

class Signer {
  static get defaults() {
    return {
    }
  }

  constructor(input, opts) {
    this.publicKey = opts.publicKey
    this.secretKey = opts.secretKey
    this.segments = input.segments
    this.dirname = input.dirname
    this.nonces = input.nonces
  }

  toString() {
    return `sign ${this.dirnamme} (pubkey=${this.publicKey && this.publicKey.toString('hex')})`
  }

  async sign(done) {
    const { publicKey, secretKey, segments, dirname, nonces } = this
    const digest = Buffer.allocUnsafe(32)

    if (Buffer.isBuffer(secretKey) && 64 === secretKey.length) {
      const signature = Buffer.allocUnsafe(crypto_sign_BYTES)
      const buffers = nonces.concat(segments)

      crypto_generichash_batch(digest, buffers)
      crypto_sign_detached(signature, digest, secretKey)

      done(null, { publicKey, signature, digest, segments, dirname, nonces })
    } else {
      done(null, { digest, segments, dirname, nonces })
    }
  }
}

module.exports = {
  Signer
}
