const { Bundler } = require('../lib/bundler')
const { Step } = require('../lib/step')
const utils = require('../lib/utils')

class Bundle extends Step {
  constructor(previous, opts) {
    opts = utils.ensureObject(opts)
    super(previous, async (done) => {
      this.bundler = new Bundler(previous.result, opts)
      this.bundler.bundle(done)
    })
  }

  toString() {
    return this.bundler ? this.bundler.toString() : 'Waiting for bundler'
  }
}

module.exports = {
  Bundle
}
