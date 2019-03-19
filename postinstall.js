const { spawn } = require('child_process')
const path = require('path')

const configure = require.resolve('sodium-native/configure')
const cwd = process.cwd()

let version = null

try {
  version = require.resolve('./include/sodium/version.h')
} catch (err) { }

if (null === version) {
  try {
    version = require.resolve('sodium-native/libsodium/src/libsodium/include/sodium/version.h')
  } catch (err) { }
}

const opts = {
  cwd: path.dirname(require.resolve('sodium-native')),
  stdio: 'inherit'
}

if (null === version) {
  spawn(configure, opts, (err) => {
    if (err) {
      throw err
    }
  })
}
