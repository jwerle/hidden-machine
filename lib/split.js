const pify = require('pify')

const HIGH_WATER_MARK = 65535

function split(buf) {
  const list = []
  const step = HIGH_WATER_MARK

  for (let i = 0; i < buf.length; i += step) {
    list.push(buf.slice(i, i + step))
  }

  return list
}

module.exports = {
  HIGH_WATER_MARK,
  split
}
