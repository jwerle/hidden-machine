const codegen  = require('../lib/codegen')
const { Step } = require('../lib/step')
const mkdirp = require('mkdirp')
const utils = require('../lib/utils')
const path = require('path')
const pify = require('pify')
const rc = require('../lib/rc')

class Codegen extends Step {
  constructor(previous, opts) {
    opts = utils.ensureObject(opts)
    super(previous, async (done) => {
      this.codegen = new codegen.Codegen(previous.result, opts)
      this.codegen.generate(done)
    })
  }

  toString() {
    return this.codegen ? this.codegen.toString() : 'Waiting for codegen'
  }
}

module.exports = {
  Codegen
}
