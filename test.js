import {readFileSync} from 'node:fs';
import test from 'ava';
import isMidi from './index.js';

/**
 * Read first n bytes of a file (default: 12 for RIFF MIDI support)
 */
function readChunk(filename, size = 12) {
	const buffer = readFileSync(filename);
	return buffer.subarray(0, size);
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

test('detects RIFF MIDI (.rmi) from Buffer', t => {
	t.true(isMidi(readChunk('fixture.rmi')));
});

test('works with Uint8Array for RIFF MIDI', t => {
	// "RIFF" + 4 size bytes + "RMID"
	const rmiHeader = new Uint8Array([
		0x52,
		0x49,
		0x46,
		0x46,
		0x00,
		0x00,
		0x00,
		0x00,
		0x52,
		0x4D,
		0x49,
		0x44,
	]);
	t.true(isMidi(rmiHeader));
});

test('rejects RIFF file that is not MIDI', t => {
	const riffWav = new Uint8Array([
		0x52,
		0x49,
		0x46,
		0x46,
		0x00,
		0x00,
		0x00,
		0x00,
		0x57,
		0x41,
		0x56,
		0x45,
	]);
	t.false(isMidi(riffWav));
});

test('rejects RIFF header too short for RMID check', t => {
	const shortRiff = new Uint8Array([
		0x52,
		0x49,
		0x46,
		0x46,
		0x00,
		0x00,
	]);
	t.false(isMidi(shortRiff));
});
