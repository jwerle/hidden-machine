const extend = require('extend')
const utils = require('./utils')
const path = require('path')
const ncc = require('@zeit/ncc')

function wrap(code) {
  const context = `
    const module = new global.process.mainModule.constructor();
    const { require, exports } = module;
    module.parent = global.process.mainModule;
  `
  const prefix = 'const wrapped ='
  const postfix = ';(wrapped(module.exports, module.require, module, null, null)); module.exports;'
  const header = `
    __dirname = 'directory name not available';
    __filename = 'filename not available';
  `
  const trim = (s) => s.trim()
  const body = trim(code)
  return trim(context) + trim(prefix + enclose(header + body) + postfix)

  function enclose(script) {
    return `(function(module, exports) { ${script} });`
  }
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
