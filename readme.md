# is-midi [![Build Status](https://travis-ci.org/chrisvogt/is-midi.svg?branch=master)](https://travis-ci.org/chrisvogt/is-midi) [![codecov](https://codecov.io/gh/chrisvogt/is-midi/badge.svg?branch=master)](https://codecov.io/gh/chrisvogt/is-midi?branch=master)

> Check if a Buffer/Uint8Array is a MIDI file


## Install

```
$ npm install is-midi
```


## Usage

##### Node.js

```js
const readChunk = require('read-chunk'); // npm install read-chunk
const isMidi = require('is-midi');
const buffer = readChunk.sync('song.mid', 0, 4);

isMidi(buffer);
//=> true
```

##### Browser

```js
const xhr = new XMLHttpRequest();
xhr.open('GET', 'song.mid');
xhr.responseType = 'arraybuffer';

xhr.onload = () => {
	isMidi(new Uint8Array(this.response));
	//=> true
};

xhr.send();
```

## API

### isMidi(buffer)

Accepts a Buffer (Node.js) or Uint8Array.

It only needs the first 4 bytes.


## Related

- [file-type](https://github.com/sindresorhus/file-type) - Detect the file type of a Buffer/Uint8Array


## License

MIT © [Chris Vogt](https://www.chrisvogt.me)
