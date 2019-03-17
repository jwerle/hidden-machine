hidden-machine
==============

Compile JavaScript into a native addon for Node.js secured by libsodium

## Install

```sh
$ npm install hidden-machine
```

## Usage

In your package.json, add the following `"prepublish"` script:

```json
...
  "main": "index.js",
  "scripts": {
    "install": "cd dist/ && node-gyp-build",
    "prepublish": "hidden-machine lib/index.js -o dist/"
  }
...
```

where `lib/` is the entry path to your module code `dist/` is the
output directory for a C file and a `binding.gyp` file, and `index.js`
exports look something like:

```js
const path = require('path')
module.exports = require('node-gyp-build')(path.resolve(__dirname, 'dist'))
```

and the calling code calls `module.initialize(Buffer.from(sharedApplicationKey, 'hex'))`.

## Example

```js
const sharedApplicationKey = generateSharedApplicationKey()
const keyPair = getKeyPair()
require('hidden-machine')('/path/to/input.js', {
  publicKey: keyPair.publicKey,
  secretKey: keyPair.secretKey,
  key: sharedApplicationKey,
}).then((result) => {
  for (cosnt step of result.steps) {
    if ('Compiler' === step.name) {
      console.log(step.output)
    }
  }
})
```

## API

### `require('hidden-machine')(input, opts)`

Compile `input` entry module into a native module with the following options:

#### `opts.publicKey`

An optional public key to use for encryption.

#### `opts.secretKey`

An optional secret key corresponding to the given public key to use for encryption.

#### `opts.secret`

A shared secret value that is a blake2b hashed and used as the seed for
public and secret key generation.

#### `opts.nonce`

The initial nonce value used for each `crypto_secretbox_easy` on each
buffer segment.

#### `opts.seed`

An optional initial seed value. If this is given, the secret is ignored.

#### `opts.key`

An optional shared secret key that is used for encryption for each
`crypto_secretbox_easy` call.

#### `opts.compile`

Everything is passed directly to [ncc](https://github.com/zeit/ncc)
including:

* `opts.compile.build` - Compiler output directory. (default: `build/`)
* `opts.compile.output` - Optional build path prefix. (default: ``)

#### `opts.bundle`

* `opts.bundle.concurrency` - The number of concurrent tasks the bundler
  will for each input target.


## License

MIT
