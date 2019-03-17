const { crypto_secretbox_MACBYTES } = require('sodium-native')
const { HIGH_WATER_MARK } = require('./split')
const strip = require('strip-indent')

class Codegen {
  constructor(input, opts) {
    this.publicKey = input.publicKey
    this.signature = input.signature
    this.segments = input.segments
    this.dirname = input.dirname
    this.digest = input.digest
    this.nonces = input.nonces
  }

  toString() {
    return `generate ${this.dirname} (${Object.keys(this.segments).length} segments)`
  }

  async generate(done) {
    const { publicKey, signature, dirname, digest } = this
    const segments = Buffer.concat(this.segments)
    const nonces = Buffer.concat(this.nonces)
    const assets = {}

    const bufferLength = segments.length -
      (this.segments.length * crypto_secretbox_MACBYTES)

    define('module.c', `
      // auto generated: ${Date()}
      #include <stdio.h>
      #include <string.h>
      #include <sodium.h>
      #include <node_api.h>
      #include <napi-macros.h>

      #define HIGH_WATER_MARK ((unsigned int) ${HIGH_WATER_MARK})
      #define PLAINTEXT_BYTES ((unsigned int) ${bufferLength})
      #define SEGMENT_BYTES ((unsigned int) ${segments.length})
      #define NONCE_BYTES ((unsigned int) ${nonces.length})

      #define SEGMENT_OFFSET ((unsigned int) crypto_secretbox_MACBYTES + HIGH_WATER_MARK)
      #define NONCE_OFFSET ((unsigned int) crypto_secretbox_NONCEBYTES)
      #define KEY_OFFSET ((unsigned int) 1)

      #define min(a, b) ((int) a <= (int) b ? a : b)

      #define npot(n) ({    \\
        unsigned int v = n; \\
        v--;                \\
        v |= v >> 1;        \\
        v |= v >> 2;        \\
        v |= v >> 4;        \\
        v |= v >> 8;        \\
        v |= v >> 16;       \\
        v++;                \\
      })

      static const char ctx[crypto_kdf_CONTEXTBYTES] = { 0 };
      static unsigned int sodium = 0;
      static char *plaintext = 0;
      static napi_ref ref = 0;

      #if ${Buffer.isBuffer(publicKey)}
      static unsigned char public_key[${publicKey.length}] = {
        ${toByteArray(publicKey)}
      };
      #endif

      #if ${Buffer.isBuffer(signature)}
      static unsigned char signature[${signature.length}] = {
        ${toByteArray(signature)}
      };
      #endif

      #if ${Buffer.isBuffer(digest)}
      static unsigned char digest[${digest.length}] = {
        ${toByteArray(digest)}
      };
      #endif

      static unsigned char segments[SEGMENT_BYTES] = {
        ${toByteArray(segments)}
      };

      static unsigned char nonces[NONCE_BYTES] = {
        ${toByteArray(nonces)}
      };

      NAPI_METHOD(unref) {
        unsigned int result = 0;

        if (0 == ref) {
          NAPI_STATUS_THROWS(napi_reference_unref(env, ref, &result))
        }

        return NULL;
      }

      NAPI_METHOD(destroy) {
        unsigned int result = 0;

        if (0 != plaintext) {
          sodium_free(plaintext);
        }

        if (0 != ref) {
          NAPI_STATUS_THROWS(napi_reference_unref(env, ref, &result))
        }

        return NULL;
      }

      NAPI_METHOD(initialize) {
        NAPI_ARGV(1)
        napi_value module;
        int len = 0;

        if (0 != ref) {
          napi_get_reference_value(env, ref, &module);
        } else if (0 == ref && 1 == argc) {
          NAPI_ARGV_BUFFER_CAST(const unsigned char *, master_key, 0);

          if (0 == sodium) {
            if (0 == sodium_init()) {
              sodium = 1;
            }
          }

          if (0 == plaintext) {
            plaintext = sodium_malloc(npot(PLAINTEXT_BYTES));

            for (
              unsigned int i = 0, j = 0, k = 0; // segments, nonces, keys
              i < SEGMENT_BYTES && j < NONCE_BYTES;
              i = i + SEGMENT_OFFSET,
              j = j + NONCE_OFFSET,
              k = k + KEY_OFFSET
            ) {
              size_t insize = min(SEGMENT_BYTES - i, crypto_secretbox_MACBYTES + HIGH_WATER_MARK);
              size_t outsize = insize - crypto_secretbox_MACBYTES;
              unsigned char segment[outsize];
              unsigned char *key = sodium_malloc(crypto_kdf_KEYBYTES);

              crypto_kdf_derive_from_key(key, crypto_kdf_KEYBYTES, i, ctx, master_key);

              if (0 == crypto_secretbox_open_easy(segment, segments + i, insize, nonces + j, key)) {
                memcpy(plaintext + len, segment, outsize);
                len += outsize;
              }

              sodium_free(key);
            }
          }

          if (0 == ref && len == PLAINTEXT_BYTES) {
            static napi_value source;
            napi_create_string_utf8(env, plaintext, PLAINTEXT_BYTES, &source);
            NAPI_STATUS_THROWS(napi_run_script(env, source, &module))
            napi_create_reference(env, module, 0, &ref);
          }
        }

        return module;
      }

      NAPI_INIT() {
        (void) public_key;
        (void) signature;
        (void) digest;

        NAPI_EXPORT_FUNCTION(initialize)
        NAPI_EXPORT_FUNCTION(unref)
      }
    `)

    define('binding.gyp',
    `{
		   "targets": [{
         "target_name": "module",
    	   "sources": [ "module.c" ],
         "include_dirs": [
           "<!(node -e \\"require('napi-macros')\\")",
           "<!(node -e \\"console.log(path.dirname(require.resolve('sodium-native/libsodium/src/libsodium/include/sodium.h')))\\")",
         ],

         "cflags": [ "-O3", "-std=c99", "-D_GNU_SOURCE" ],

    	   "xcode_settings": {
           "OTHER_CFLAGS": [ "-O3", "-std=c99", "-D_GNU_SOURCE" ]
         },

         "conditions": [
           ["OS != 'mac' and OS != 'win'", {
             "link_settings": { "libraries": [ "-Wl,-rpath=\\$$ORIGIN" ] }
           }],
         ],

         "libraries": [
           "<!(node -e \\"require('sodium-native/preinstall')\\"  -- --print-lib)"
         ],
       }]
    }`)


    return done(null, { dirname, assets })
    function define(filename, source) {
      assets[filename] = {
        source: Buffer.from(strip(source))
      }
    }
  }
}

function toByteArray(buffer, format) {
  return [ ...buffer ].map(map).join(', ')
  function map(b, i) {
    return `${format && i > 0 && 0 == i % 4 ? '\n' : ''}0x${b.toString(16)}`
  }
}

module.exports = {
  Codegen
}
