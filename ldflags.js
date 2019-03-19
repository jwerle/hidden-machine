const path = require('path')
const os = require('os')
const fs = require('fs')

const platform = os.platform()
const arch = os.arch()
const ua = `${platform}-${arch}`

const dirname = path.resolve(
  path.relative('.',
    path.join(
      path.dirname(require.resolve('sodium-native')),
      `/prebuilds/${ua}`)))

const ldflags = [
  `-rpath=${dirname}`,
  `-rpath='$$ORIGIN'`,
]

module.exports = ldflags.join(',')
