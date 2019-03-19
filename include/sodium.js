const path = require('path')

const paths = [
  path.resolve(
    path.relative('.',
      path.join(
        path.dirname(require.resolve('sodium-native')),
        path.join('libsodium', 'src', 'libsodium', 'include')
      ))),

  path.resolve(__dirname),
]

module.exports = paths.join(' ')
