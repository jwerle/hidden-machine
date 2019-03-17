const crypto = require('crypto')
const extend = require('extend')
const path = require('path')

const defaults = {
  compile: { build: './build', cache: true },
  bundle: { },
  segment: { },
  sign: { },
  codegen: { },
}

module.exports = extend(true, defaults, require('rc')('hmc'))
