const path = require('path')

// basically a "re-export" of: https://github.com/mafintosh/napi-macros/blob/master/index.js
module.exports = path.resolve(path.relative('.', path.dirname(require.resolve('napi-macros'))))
