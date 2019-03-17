const { Signer } = require('../lib/signer')
const { Step } = require('../lib/step')
const utils = require('../lib/utils')

class Sign extends Step {
  constructor(previous, opts) {
    opts = utils.ensureObject(opts)
    super(previous, async (done) => {
      this.signer = new Signer(previous.result, opts)
      this.signer.sign(done)
    })
  }

  toString() {
    return this.signer ? this.signer.toString() : 'Waiting for signer'
  }
}

module.exports = {
  Sign
}
