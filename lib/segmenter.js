const { randomBytes } = require('crypto')
const { split } = require('./split')
const increment = require('increment-buffer')
const extend = require('extend')
const crypto = require('crypto')
const utils = require('./utils')
const pify = require('pify')
const fs = require('fs')

const {
  crypto_secretbox_NONCEBYTES,
  crypto_secretbox_MACBYTES,
  crypto_kdf_CONTEXTBYTES,
  crypto_kdf_KEYBYTES,

  crypto_kdf_derive_from_key,
  crypto_secretbox_easy,
} = require('sodium-native')

const readFile = pify(fs.readFile)
const unlink = pify(fs.unlink)

class Segmenter {
  static get defaults() {
    return {
      nonce: crypto.randomBytes(crypto_secretbox_NONCEBYTES)
    }
  }

  constructor(input, opts) {
    opts = extend(true, Segmenter.defaults, utils.ensureObject(opts))
    this.segments = []
    this.filename = input.filename
    this.dirname = input.dirname
    this.assets = input.assets
    this.nonce = opts.nonce
    this.code = input.code
    this.map = input.map
    this.key = opts.key
  }

  toString() {
    return `segment ${this.filename} (nonce = ${this.nonce.toString('hex')})`
  }

  async segment(done) {
    const { filename, dirname, assets } = this
    const segments = [ ]
    const nonces = [ ]

    let bufferLength = 0
    let nonce = copy(this.nonce)

    try {
      const buffer = await readFile(filename)
      const buffers = split(buffer)
      const masterKey = this.key.slice(0, 32)
      bufferLength = buffer.length
      for (let i = 0; i < buffers.length; ++i) {
        nonces[i] = nonce
        const segment = box(kdf(i, masterKey), nonce, buffers[i])
        segments.push(segment)
        nonce = increment(copy(nonce))
      }
    } catch (err) {
      return done(err)
    }

    // remove bundle after segmentation
    await unlink(filename)
    return done(null, { segments, nonces, dirname, filename, bufferLength })

    function kdf(i, masterKey) {
      const key = Buffer.allocUnsafe(crypto_kdf_KEYBYTES)
      const ctx = Buffer.alloc(crypto_kdf_CONTEXTBYTES)
      crypto_kdf_derive_from_key(key, i, ctx, masterKey)
      return key
    }

    function box(key, nonce, buffer) {
      const length = crypto_secretbox_MACBYTES + buffer.length
      const ciphertext = Buffer.alloc(length)
      crypto_secretbox_easy(ciphertext, buffer, nonce, key)
      return ciphertext
    }

    function copy(x) {
      const y = Buffer.allocUnsafe(x.length)
      x.copy(y, 0, 0, x.length)
      return y
    }
  }
}

module.exports = {
  Segmenter
}
