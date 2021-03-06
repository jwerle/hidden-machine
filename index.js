const { randomBytes } = require('crypto')
const { Codegen } = require('./steps/codegen')
const { Compile } = require('./steps/compile')
const { Segment } = require('./steps/segment')
const { Bundle } = require('./steps/bundle')
const { Sign } = require('./steps/sign')
const extend = require('extend')
const debug = require('debug')('hidden-machine')
const Batch = require('batch')
const utils = require('./lib/utils')
const pify = require('pify')
const rc = require('./lib/rc')

const {
  crypto_secretbox_NONCEBYTES,
  crypto_sign_PUBLICKEYBYTES,
  crypto_sign_SECRETKEYBYTES,
  crypto_sign_SEEDBYTES,
  crypto_kdf_KEYBYTES,

  crypto_sign_seed_keypair,
  crypto_generichash_batch,
} = require('sodium-native')

function ensureBufferWithSize(buffer, size) {
  return Buffer.isBuffer(buffer) && buffer.length >= size ? buffer : null
}

async function start(input, opts) {
  const queue = new Batch().concurrency(1)
  const steps = []

  opts = extend(true, rc, utils.ensureObject(opts))

  const publicKey = (
    ensureBufferWithSize(
      utils.toBuffer(opts.publicKey, 'hex'),
      crypto_sign_PUBLICKEYBYTES) ||
    Buffer.allocUnsafe(crypto_sign_PUBLICKEYBYTES)
  )

  const secretKey = (
    ensureBufferWithSize(
      utils.toBuffer(opts.secretKey, 'hex'),
      crypto_sign_SECRETKEYBYTES) ||
    Buffer.allocUnsafe(crypto_sign_SECRETKEYBYTES)
  )

  const secret = (
    ensureBufferWithSize(utils.toBuffer(opts.secret), 8) ||
    randomBytes(32)
  )

  const nonce = ensureBufferWithSize(
    utils.toBuffer(opts.nonce, 'hex'),
    crypto_secretbox_NONCEBYTES
  )

  const seed = (
    ensureBufferWithSize(
      utils.toBuffer(opts.seed, 'hex'),
      crypto_sign_SEEDBYTES) ||
    Buffer.allocUnsafe(crypto_sign_SEEDBYTES)
  )

  const key = (
    ensureBufferWithSize(
      utils.toBuffer(opts.key, 'hex'),
      crypto_kdf_KEYBYTES) ||
    secretKey.slice(0, crypto_kdf_KEYBYTES)
  )

  if (!opts.publicKey || !opts.secretKey) {
    if (!opts.seed) {
      crypto_generichash_batch(seed, [ secret ])
    }
    crypto_sign_seed_keypair(publicKey, secretKey, seed)
  }

  if (true === opts.keygen) {
    return {
      publicKey, secretKey, secret, key
    }
  }

  opts.sign.publicKey = publicKey
  opts.sign.secretKey = secretKey

  opts.segment.key = key

  if (null !== nonce) {
    opts.segment.nonce = nonce
  }

  push(Compile, input, opts.compile)
  push(Bundle, opts.bundle)
  push(Segment, opts.segment)
  push(Sign, opts.sign)
  push(Codegen, opts.codegen)
  push(Bundle, opts.bundle)

  let previous = null
  for (const step of steps) {
    queue.push((next) => {
      if (null !== previous) {
        hook('afterstep', step)
      }

      process.nextTick(() => {
        hook('beforestep', step)
        step.start((...args) => {
          hook('step', step, ...args)
          previous = step
          next(...args)
        })
      })
    })
  }

  await pify(queue.end.bind(queue))()

  return {
    input, steps, publicKey, secretKey, secret, key
  }

  function hook(name, ...args) {
    const k = `on${name}`
    if ('function' === typeof opts[k]) {
      try {
        opts[k](...args)
      } catch (err) {
        debug(err)
        return hook('error', err)
      }
    }
  }

  function push(Step, ...args) {
    steps.push(new Step(steps[steps.length - 1], ...args))
  }
}

module.exports = start
