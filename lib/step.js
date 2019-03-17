const { inspect } = require('util')
const Timer = require('nanotimer')

class Step {
  constructor(previous, run) {
    if (previous && !run) {
      run = previous
      previous = null
    }

    this.previous = previous
    this.timing = 0
    this.timer = new Timer()
    this.work = null
    this.run = run
  }

  get name() {
    return this.constructor.name
  }

  [inspect.custom]() {
    return this.toString()
  }

  start(done) {
    const work = (cb) => {
      this.work = this.run((err, result) => {
        this.result = result
        done(err, result)
        cb(err, result)
      })
    }

    return this.timer.time(work, null, 'u', (timing) => {
      this.timing = timing
    })
  }
}

module.exports = {
  Step
}
