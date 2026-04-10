# is-midi [![CI](https://github.com/chrisvogt/is-midi/actions/workflows/ci.yml/badge.svg)](https://github.com/chrisvogt/is-midi/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/chrisvogt/is-midi/badge.svg?branch=main)](https://codecov.io/gh/chrisvogt/is-midi?branch=main) [![npm version](https://img.shields.io/npm/v/is-midi.svg)](https://www.npmjs.com/package/is-midi)

> Check if a Buffer/Uint8Array is a MIDI file (supports standard MIDI and RIFF MIDI/.rmi)

## Why this exists

File names and extensions are easy to spoof. Full MIDI parsers are heavier than you need when all you want is an answer to: **“Is this binary actually MIDI (or RIFF MIDI), before I trust it or send it downstream?”** This package answers that from the **first few bytes**, in **Node or the browser**, with **no dependencies**.

**Typical uses:**

- **Uploads and forms** — Reject non-MIDI before storage, virus scanning, or transcription pipelines; optionally use `isMidiHeaderPlausible` when you want a bit more than raw magic bytes.
- **Web apps** — After a user picks a file or you `fetch` an asset, gate previews, players, or converters so you do not hand garbage to a parser library.
- **Tooling and scripts** — The `is-midi` CLI fits shell pipelines, quick checks on a laptop, or CI jobs that assert artifacts are MIDI.
- **Polymorphic pipelines** — Pair with something like [`file-type`](https://github.com/sindresorhus/file-type) for broad sniffing, then use `is-midi` / `sniffMidi` when you care specifically about `.mid` vs `.rmi` wrapping.

It does **not** parse tracks, lyrics, or tempo maps. Use a dedicated MIDI parser when you need structure and validation through the whole file; use `is-midi` when you need a **fast, cheap identification step**.

## Install

```sh
npm install is-midi
```

## Usage

You only need a **short prefix** of the file: **4 bytes** for standard MIDI (`MThd`), **12 bytes** for RIFF MIDI (`.rmi`), **14 bytes** if you use the stricter `isMidiHeaderPlausible` on SMF. Reading the entire file is unnecessary for detection.

### Web (browser)

**`fetch`** — only the first bytes need to end up in a `Uint8Array` (here the response is fully buffered, then sliced):

```js
import {MIN_BYTES_TO_SNIFF, isMidi, sniffMidi} from 'is-midi';

const response = await fetch('/assets/song.mid');
if (!response.ok) {
	throw new Error(`HTTP ${response.status}`);
}

const full = new Uint8Array(await response.arrayBuffer());
const prefix = full.subarray(0, Math.min(full.length, MIN_BYTES_TO_SNIFF));

isMidi(prefix);
//=> true

sniffMidi(prefix);
//=> { format: 'smf' }
```

**`<input type="file">`** — read just the start of the file with `Blob.slice`, so large uploads are not fully loaded into memory:

```js
import {isMidi, isMidiHeaderPlausible} from 'is-midi';

document.querySelector('#file').addEventListener('change', async (event) => {
	const [file] = event.target.files;
	if (!file) {
		return;
	}

	const prefix = new Uint8Array(await file.slice(0, 14).arrayBuffer());

	console.log('looks like MIDI:', isMidi(prefix));
	console.log('header plausible:', isMidiHeaderPlausible(prefix));
});
```

`slice(0, 14)` covers `isMidi` (12 bytes for `.rmi`) and `isMidiHeaderPlausible` on standard MIDI (14-byte header).

### Node.js (partial read)

```js
import {open} from 'node:fs/promises';
import {MIN_BYTES_TO_SNIFF, isMidi} from 'is-midi';

const path = 'song.mid';
const handle = await open(path, 'r');
try {
	const buf = new Uint8Array(MIN_BYTES_TO_SNIFF);
	const {bytesRead} = await handle.read(buf, 0, MIN_BYTES_TO_SNIFF, 0);
	isMidi(buf.subarray(0, bytesRead));
	//=> true
} finally {
	await handle.close();
}
```

### Node.js CLI

After `npm install is-midi`, the binary is **`is-midi`** (also available via **`npx is-midi`** without a global install).

```sh
# Exit code 0 if the file prefix looks like MIDI; 1 otherwise
is-midi ./song.mid
echo "exit: $?"

# Stricter check (SMF header fields + sensible RIFF size)
is-midi --plausible ./song.mid

# Print container kind for scripts: smf | rmi | no (stdout); exit code unchanged
is-midi --print ./recording.mid
is-midi --print ./jingle.rmi

# Pipe the first bytes on stdin (read only a prefix of a large file)
head -c 14 ./song.mid | is-midi --print

# Help
is-midi --help
```

**Without installing** (one-off from the registry):

```sh
npx is-midi --print ./song.mid
```

## API

### `isMidi(buffer)`

Returns `true` if the buffer starts like a standard MIDI file (`MThd`) or RIFF-wrapped MIDI (`.rmi`). **Magic bytes only** — fast and enough for routing uploads, CDN rules, or file pickers.

### `sniffMidi(buffer)`

Returns `{ format: 'smf' | 'rmi' }`, or `undefined` when the prefix does not match. Use this when you need to branch on container type (logging, MIME hints, downstream parsers).

### `isMidiHeaderPlausible(buffer)`

Stricter check: for **SMF**, validates header chunk length (6), format type (0–2), and track counts (including type 0 ⇒ single track). For **RIFF MIDI**, checks that the RIFF payload size is sane. Needs **14 bytes** for SMF, **12** for RIFF MIDI.

Sniffing answers “does this *look* like MIDI at the start?”; this function rejects more accidental `MThd` / `RIFF` collisions but still does **not** validate the entire file.

### Constants

- `MIN_BYTES_SMF` — `4`
- `MIN_BYTES_RMI` — `12`
- `MIN_BYTES_TO_SNIFF` — `12` (enough for `sniffMidi` / `isMidi` on unknown input)

#### `buffer`

Type: `Buffer | Uint8Array`. Missing or too-short input yields `false` from `isMidi` / `isMidiHeaderPlausible` and `undefined` from `sniffMidi`.

## MIME types and extensions

| Kind | Typical extensions | MIME (IANA / common) |
|------|-------------------|------------------------|
| Standard MIDI | `.mid`, `.midi` | [`audio/midi`](https://www.iana.org/assignments/media-types/audio/midi); some systems also use `audio/x-midi` |
| RIFF MIDI | `.rmi` | Often still served as `audio/midi`; there is no separate IANA type required for the wrapper |

Treat **extensions as hints**: always inspect bytes (e.g. with this package) for anything security- or pipeline-sensitive.

## Works with `file-type`

[is-midi](https://www.npmjs.com/package/is-midi) focuses on MIDI only with zero dependencies. For **polymorphic** detection across many formats, use [Sindre Sorhus’ `file-type`](https://github.com/sindresorhus/file-type) first; if you need to **disambiguate** or double-check MIDI specifically, pass the same buffer prefix into `isMidi` / `sniffMidi` (you still only need the first 12–14 bytes).

## When you need more than detection

This package does **not** parse tracks, tempo maps, or lyrics. For full structure, errors, and playback metadata, use a MIDI parser library instead; keep `is-midi` as a cheap first gate.

## How it works

MIDI files start with the magic bytes `MThd` (hex: `4D 54 68 64`).

RIFF-wrapped MIDI files (`.rmi`) start with `RIFF`, a 4-byte little-endian size, then the form type `RMID`.

## Related

- [file-type](https://github.com/sindresorhus/file-type) - Detect many file types from a Buffer/Uint8Array

## License

MIT © [Chris Vogt](https://chrisvogt.me)
