const isUndefined = (value) => undefined === value
const isFunction = (value) => 'function' === typeof value
const isObject = (value) => !isNull(value) && 'object' === typeof value
const isArray = (value) => Array.isArray(value)
const isNull = (value) => null === value
const noop = () => void 0

function ensureObject(obj, defaults) {
  return isUndefined(obj) && isUndefined(defaults) ? {}
    : isObject(obj) ? obj
    : isArray(obj) ? obj
    : isUndefined(obj) ? ensureObject(defaults)
    : isNull(obj) ? ensureObject(defaults)
    : ensureObject(defaults)
}

function ensureFunction(callback, defaultFunction) {
  return isFunction(callback) ? callback
    : isFunction(defaultFunction) ? defaultFunction
    : noop
}

function promisedErrBack(promise, callback) {
  return promise.then((result) => callback(null, result)).catch(callback)
}

function toBuffer(buffer, enc) {
  return Buffer.isBuffer(buffer) ? buffer
    : 'string' === typeof buffer ? Buffer.from(buffer, enc)
    : Buffer.alloc(0)
}

module.exports = {
  promisedErrBack,
  ensureObject,
  isUndefined,
  isFunction,
  isObject,
  toBuffer,
  isArray,
  isNull,
  noop,
}
