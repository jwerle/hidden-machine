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

const ldflags = []

if ('linux' === platform) {
  ldflags.push(
    `-Wl,-rpath=${dirname}`,
    `-Wl,-rpath='$$ORIGIN'`,
  )
}

if ('mac' === platform) {
  ldflags.push(
    `-Wl,-rpath,@loader_path${dirname}`,
  )
}

module.exports = ldflags.join(' ')
