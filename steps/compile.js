const { Compiler } = require('../lib/compiler')
const { Step } = require('../lib/step')

class Compile extends Step {
  constructor(previous, input, opts) {
    super(previous, (done) => {
      this.compiler = new Compiler(previous && previous.result || input, opts)
      this.compiler.compile(done)
    })
  }

  toString() {
    return this.compiler ? this.compiler.toString() : 'Waiting for compiler'
  }
}

module.exports = {
  Compile
}
