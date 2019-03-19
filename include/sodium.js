const path = require('path')

module.exports = path.resolve(
  path.relative('.',
    path.join(
      path.dirname(require.resolve('sodium-native')),
      path.join('libsodium', 'src', 'libsodium', 'include')
    )))
