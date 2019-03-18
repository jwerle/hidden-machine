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
    "prepublish": "hidden-machine lib/index.js -o dist/ --key=$SHARED_APP_KEY"
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

and the calling code calls `require('your-hidden-module').initialize(Buffer.from(sharedApplicationKey, 'hex'))`.

where `sharedApplicationKey` can be generated with by running the following:

```sh
$ hidden-machine --keygen ## use --json for JSON output
...
 hidden-machine: publicKey= f4e6a97ae2a2d568de4f9b4144e736cd71ab338881cee6c44a48ced4cd66b504
 hidden-machine: secretKey= 3f9632bc7dc125fe399ed2f7739233274428bc96bdb8ece9ba5937a988fb5b4df4e6a97ae2a2d568de4f9b4144e736cd71ab338881cee6c44a48ced4cd66b504
 hidden-machine: secret= 211536a908a2e650f00c38867c9a4696a1d073323a0c2ac6a1a8f4012265f82a
 hidden-machine: key= 3f9632bc7dc125fe399ed2f7739233274428bc96bdb8ece9ba5937a988fb5b4d
```

and can be used when publishing or packing your module:

```sh
$ SHARED_APP_KEY=3f9632bc7dc125fe399ed2f7739233274428bc96bdb8ece9ba5937a988fb5b4d npm publish # or pack
```

## Example

```js
const sharedApplicationKey = generateSharedApplicationKey()
const keyPair = getKeyPair()
require('hidden-machine')('/path/to/input.js', {
  publicKey: keyPair.publicKey,
  secretKey: keyPair.secretKey,
  key: sharedApplicationKey,
}).then((result) => {
  for (const step of result.steps) {
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
