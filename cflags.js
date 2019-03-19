const cflags = [
  '-D_GNU_SOURCE',
  '-std=c99',
  '-O3',
]

module.exports = cflags.join(' ')
