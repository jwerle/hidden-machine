const extend = require('extend')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const Batch = require('batch')
const utils = require('./utils')
const pify = require('pify')
const path = require('path')
const rc = require('./rc')
const os = require('os')
const fs = require('fs')

const writeFile = pify(fs.writeFile)
const readFile = pify(fs.readFile)

class Bundler {
  static get defaults() {
    return {
      concurrency: os.cpus().length
    }
  }

  constructor(input, opts) {
    this.map = input.map
    this.opts = extend(true, Bundler.defaults, utils.ensureObject(opts))
    this.code = input.code
    this.assets = input.assets
    this.dirname = input.dirname
    this.filename = input.filename
  }

  toString() {
    return `bundle ${this.filename || this.dirname} (${Object.keys(this.assets).length} assets)`
  }

  async bundle(done) {
    const { dirname, filename, map, code } = this
    const assets = []
    const queue = new Batch().concurrency(this.opts.concurrency)

    if ('string' === typeof filename) {
      if (Buffer.isBuffer(this.code) || 'string' === typeof this.code) {
        queue.push((next) => {
          mkdirp(path.dirname(filename), (err) => {
            utils.promisedErrBack(writeFile(filename, this.code), next)
          })
        })
      }
    }

    if (null !== this.assets && 'object' === typeof this.assets) {
      for (const k in this.assets) {
        const { source } = this.assets[k]
        const filename = path.resolve(dirname, k)
        assets.push(filename)
        queue.push((next) => {
          mkdirp(path.dirname(filename), (err) => {
            if (err) { return next(err) }
            utils.promisedErrBack(writeFile(filename, source), next)
          })
        })
      }
    }

    try {
      await pify(queue.end.bind(queue))()
      done(null, { dirname, filename, assets, code, map })
    } catch (err) {
      done(err)
    }
  }
}

module.exports = {
  Bundler
}
