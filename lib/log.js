const { bold, black } = require('chalk')
const pkg = require('../package.json')
const util = require('util')

function log(stream, prefix, format, ...message) {
  if ('string' === typeof stream) {
    return log(process.stdout, '', stream, prefix, ...[ format, ...message ])
  }

  if (null != prefix) { prefix = String(prefix) }
  if (null != format) { format = String(format) }

  if (!prefix) { prefix = '' }
  if (!format) { format = '' }

  message = message.filter(m => undefined !== m)
  const string = util.format(format, ...message)

  stream.write(` ${bold(black(`${pkg.name}:`))} ${prefix}`)
  stream.write(string)
  stream.write('\n')

  return string
}

module.exports = {
  log
}
