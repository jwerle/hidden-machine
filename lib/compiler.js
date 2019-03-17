const extend = require('extend')
const utils = require('./utils')
const path = require('path')
const ncc = require('@zeit/ncc')

function wrap(code) {
  return `
  __dirname = 'directory name not available';
  ${code}
  `.trim()
}

class Compiler {
  static get defaults() {
    return {
      v8cache: false,
    }
  }

  constructor(input, opts) {
    this.opts = extend(true, Compiler.defaults, utils.ensureObject(opts))
    this.input = input
    this.build = path.resolve('.', opts.build)
    this.output = path.resolve(this.build, opts.output || '')
  }

  toString() {
    return `compile ${this.input} -> ${this.output}`
  }

  async compile(done) {
    const { input, output, build, opts } = this
    try {
      const result = await ncc(input, opts)
      result.code = wrap(result.code)
      result.dirname = this.output
      result.filename = path.resolve(this.output, 'out.js')
      done(null, result)
    } catch (err) {
      done(err)
    }
  }
}

module.exports = {
  Compiler
}
