const { spawn } = require('child_process')
const path = require('path')
const configure = require.resolve('sodium-native/configure')
const cwd = process.cwd()

const opts = {
  cwd: path.dirname(require.resolve('sodium-native')),
  stdio: 'inherit'
}
spawn(configure, opts, (err) => {
  if (err) {
    throw err
  }
})
