const { soname } = require('libsodium-prebuilt/paths')
const path = require('path')
const os = require('os')
const fs = require('fs')

const platform = os.platform()
const arch = os.arch()
const ua = `${platform}-${arch}`

const dirname = path.resolve(
  path.relative('.',
    path.join(
      path.dirname(require.resolve('libsodium-prebuilt')),
      `/prebuilds/${ua}/lib`)))

const libs = fs.readdirSync(dirname)
let result = ''
for (const lib of libs) {
  if (lib.match(soname)) {
    result = path.join(dirname, lib)
    break
  }
}

module.exports = result
