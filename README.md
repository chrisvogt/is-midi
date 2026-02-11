# is-midi [![CI](https://github.com/chrisvogt/is-midi/actions/workflows/ci.yml/badge.svg)](https://github.com/chrisvogt/is-midi/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/chrisvogt/is-midi/badge.svg?branch=main)](https://codecov.io/gh/chrisvogt/is-midi?branch=main) [![npm version](https://img.shields.io/npm/v/is-midi.svg)](https://www.npmjs.com/package/is-midi)

> Check if a Buffer/Uint8Array is a MIDI file

## Install

```sh
npm install is-midi
```

## Usage

### Node.js

```js
import { readFileSync } from 'node:fs';
import isMidi from 'is-midi';

const buffer = readFileSync('song.mid');
isMidi(buffer);
//=> true
```

### Browser

```js
const response = await fetch('song.mid');
const buffer = new Uint8Array(await response.arrayBuffer());

isMidi(buffer);
//=> true
```

## API

### isMidi(buffer)

Returns `true` if the buffer is a MIDI file, `false` otherwise.

#### buffer

Type: `Buffer | Uint8Array`

The buffer to check. It only needs the first 4 bytes.

## How it works

MIDI files start with the magic bytes `MThd` (hex: `4D 54 68 64`). This package checks for those bytes to determine if a file is a MIDI file.

## Related

- [file-type](https://github.com/sindresorhus/file-type) - Detect the file type of a Buffer/Uint8Array

## License

MIT © [Chris Vogt](https://www.chrisvogt.me)
