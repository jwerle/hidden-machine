const paths = require('libsodium-prebuilt/paths')
const ldflags = [
  `-rpath=${paths.lib}`,
  `-rpath='$$ORIGIN'`,
]

module.exports = ldflags.join(',')
