import {readFileSync} from 'node:fs';
import test from 'ava';
import isMidi from './index.js';

/**
 * Read first 4 bytes of a file
 */
function readChunk(filename) {
	const buffer = readFileSync(filename);
	return buffer.subarray(0, 4);
}

test('detects MIDI from Buffer', t => {
	t.true(isMidi(readChunk('fixture.mid')));
});

test('rejects WAV file', t => {
	t.false(isMidi(readChunk('fixture.wav')));
});

test('rejects text file', t => {
	t.false(isMidi(readChunk('fixture.txt')));
});

test('returns false for empty input', t => {
	t.false(isMidi());
	t.false(isMidi(null));
	t.false(isMidi(undefined));
	t.false(isMidi(new Uint8Array(0)));
});

test('returns false for buffer too short', t => {
	t.false(isMidi(new Uint8Array([0x4D, 0x54, 0x68]))); // Only 3 bytes
});

test('works with Uint8Array', t => {
	const midiHeader = new Uint8Array([0x4D, 0x54, 0x68, 0x64]); // "MThd"
	t.true(isMidi(midiHeader));
});

test('rejects similar but incorrect magic bytes', t => {
	const notMidi = new Uint8Array([0x4D, 0x54, 0x68, 0x65]); // "MThe" not "MThd"
	t.false(isMidi(notMidi));
});
