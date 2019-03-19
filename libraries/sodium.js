const path = require('path')
const os = require('os')
const fs = require('fs')

const platform = os.platform()
const library = 'libsodium' // .so|.dylib|.dll
const arch = os.arch()
const ua = `${platform}-${arch}`

const dirname = path.resolve(
  path.relative('.',
    path.join(
      path.dirname(require.resolve('sodium-native')),
      `/prebuilds/${ua}`)))

const libs = fs.readdirSync(dirname)
let result = ''
for (const lib of libs) {
  if (lib.match(library)) {
    result = path.join(dirname, lib)
    break
  }
}

module.exports = result
