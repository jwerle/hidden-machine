const { Segmenter } = require('../lib/segmenter')
const { Step } = require('../lib/step')
const mkdirp = require('mkdirp')
const utils = require('../lib/utils')
const Batch = require('batch')
const path = require('path')
const pify = require('pify')
const rc = require('../lib/rc')

class Segment extends Step {
  constructor(previous, opts) {
    opts = utils.ensureObject(opts)
    super(previous, async (done) => {
      this.segmenter = new Segmenter(previous.result, opts)
      this.segmenter.segment(done)
    })
  }

  toString() {
    return this.segmenter ? this.segmenter.toString() : 'Waiting for segmenter'
  }
}

module.exports = {
  Segment
}
