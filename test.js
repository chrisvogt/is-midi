import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import isMidi, {
	isMidiHeaderPlausible,
	MIN_BYTES_RMI,
	MIN_BYTES_SMF,
	MIN_BYTES_TO_SNIFF,
	sniffMidi,
} from './index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const cliJs = path.join(dirname, 'cli.js');

/**
 * Read first n bytes of a file (default: 12 for RIFF MIDI support)
 * @param {string} filename
 * @param {number} [size]
 */
function readChunk(filename, size = 12) {
	const buffer = readFileSync(path.join(dirname, filename));
	return buffer.subarray(0, size);
}

test('constants match documented minimums', t => {
	t.is(MIN_BYTES_SMF, 4);
	t.is(MIN_BYTES_RMI, 12);
	t.is(MIN_BYTES_TO_SNIFF, 12);
});

test('sniffMidi detects SMF and RIFF', t => {
	t.deepEqual(sniffMidi(readChunk('fixture.mid')), {format: 'smf'});
	t.deepEqual(sniffMidi(readChunk('fixture.rmi')), {format: 'rmi'});
	t.is(sniffMidi(readChunk('fixture.wav')), undefined);
	t.is(sniffMidi(readChunk('fixture.txt')), undefined);
	t.is(sniffMidi(undefined), undefined);
});

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

test('isMidiHeaderPlausible accepts fixtures', t => {
	t.true(isMidiHeaderPlausible(readFileSync(path.join(dirname, 'fixture.mid')).subarray(0, 14)));
	t.true(isMidiHeaderPlausible(readChunk('fixture.rmi')));
});

test('isMidiHeaderPlausible requires 14 bytes for SMF', t => {
	const mid = readFileSync(path.join(dirname, 'fixture.mid'));
	t.false(isMidiHeaderPlausible(mid.subarray(0, 13)));
	t.true(isMidiHeaderPlausible(mid.subarray(0, 14)));
});

test('isMidiHeaderPlausible rejects bad SMF header chunk length', t => {
	const buf = new Uint8Array(14);
	buf.set([
		0x4D,
		0x54,
		0x68,
		0x64,
	]); // MThd
	buf[7] = 7; // Chunk length bytes 4-7 become 0,0,0,7 (not 6)
	t.true(isMidi(buf.subarray(0, 12)));
	t.false(isMidiHeaderPlausible(buf));
});

test('isMidiHeaderPlausible rejects invalid SMF format type', t => {
	const buf = new Uint8Array(14);
	buf.set([
		0x4D,
		0x54,
		0x68,
		0x64,
		0x00,
		0x00,
		0x00,
		0x06,
		0x00,
		0x03,
		0x00,
		0x01,
		0x00,
		0x00,
	]);
	t.true(isMidi(buf));
	t.false(isMidiHeaderPlausible(buf));
});

test('isMidiHeaderPlausible rejects SMF type 0 with multiple tracks', t => {
	const buf = new Uint8Array(14);
	buf.set([
		0x4D,
		0x54,
		0x68,
		0x64,
		0x00,
		0x00,
		0x00,
		0x06,
		0x00,
		0x00,
		0x00,
		0x02,
		0x00,
		0x00,
	]);
	t.true(isMidi(buf));
	t.false(isMidiHeaderPlausible(buf));
});

test('isMidiHeaderPlausible rejects RIFF MIDI with tiny payload size', t => {
	const buf = new Uint8Array(12);
	buf.set([
		0x52,
		0x49,
		0x46,
		0x46,
		0x03,
		0x00,
		0x00,
		0x00,
		0x52,
		0x4D,
		0x49,
		0x44,
	]);
	t.true(isMidi(buf));
	t.false(isMidiHeaderPlausible(buf));
});

test('isMidiHeaderPlausible rejects oversized RIFF payload', t => {
	const buf = new Uint8Array(12);
	const tooBig = (512 * 1024 * 1024) + 1;
	const le = new Uint8Array(4);
	new DataView(le.buffer).setUint32(0, tooBig, true);
	buf.set([
		0x52,
		0x49,
		0x46,
		0x46,
		le[0],
		le[1],
		le[2],
		le[3],
		0x52,
		0x4D,
		0x49,
		0x44,
	]);
	t.true(isMidi(buf));
	t.false(isMidiHeaderPlausible(buf));
});

test('isMidiHeaderPlausible returns false when prefix is not MIDI', t => {
	t.false(isMidiHeaderPlausible(undefined));
	t.false(isMidiHeaderPlausible(readChunk('fixture.txt')));
});

test('isMidiHeaderPlausible rejects SMF with zero tracks', t => {
	const buf = new Uint8Array(14);
	buf.set([
		0x4D,
		0x54,
		0x68,
		0x64,
		0x00,
		0x00,
		0x00,
		0x06,
		0x00,
		0x01,
		0x00,
		0x00,
		0x00,
		0x00,
	]);
	t.true(isMidi(buf));
	t.false(isMidiHeaderPlausible(buf));
});

test('CLI exits 0 for fixture.mid', t => {
	execFileSync(process.execPath, [cliJs, path.join(dirname, 'fixture.mid')], {stdio: 'ignore'});
	t.pass();
});

test('CLI exits 1 for fixture.txt', t => {
	const error = t.throws(() => {
		execFileSync(process.execPath, [cliJs, path.join(dirname, 'fixture.txt')], {stdio: 'ignore'});
	});
	t.is(/** @type {{status?: number}} */ (error).status, 1);
});

test('CLI --print outputs format', t => {
	const smfOut = execFileSync(process.execPath, [cliJs, '--print', path.join(dirname, 'fixture.mid')], {encoding: 'utf8'});
	t.is(smfOut.trimEnd(), 'smf');
	const rmiOut = execFileSync(process.execPath, [cliJs, '--print', path.join(dirname, 'fixture.rmi')], {encoding: 'utf8'});
	t.is(rmiOut.trimEnd(), 'rmi');
});

test('CLI --plausible exits 0 for fixtures', t => {
	execFileSync(process.execPath, [cliJs, '--plausible', path.join(dirname, 'fixture.mid')], {stdio: 'ignore'});
	execFileSync(process.execPath, [cliJs, '--plausible', path.join(dirname, 'fixture.rmi')], {stdio: 'ignore'});
	t.pass();
});

test('CLI --help and -h exit 0 and print usage', t => {
	for (const flag of ['--help', '-h']) {
		const result = spawnSync(process.execPath, [cliJs, flag], {encoding: 'utf8'});
		t.is(result.status, 0);
		t.true((result.stderr ?? '').includes('Usage:'));
	}
});

test('CLI exits 2 for unknown option or too many arguments', t => {
	let result = spawnSync(process.execPath, [cliJs, '--not-an-option'], {encoding: 'utf8'});
	t.is(result.status, 2);
	t.true((result.stderr ?? '').includes('Unknown option:'));

	result = spawnSync(process.execPath, [cliJs, 'fixture.mid', 'fixture.rmi'], {
		cwd: dirname,
		encoding: 'utf8',
	});
	t.is(result.status, 2);
	t.true((result.stderr ?? '').includes('Too many arguments'));
});

test('CLI reads from stdin when no file path is given', t => {
	const fixturePath = path.join(dirname, 'fixture.mid');
	const input = readFileSync(fixturePath).subarray(0, 20);
	const result = spawnSync(process.execPath, [cliJs, '--print'], {
		cwd: dirname,
		input,
		encoding: 'utf8',
	});
	t.is(result.status, 0);
	t.is((result.stdout ?? '').trimEnd(), 'smf');
});

test('CLI --print writes no when file is not MIDI', t => {
	const result = spawnSync(process.execPath, [cliJs, '--print', path.join(dirname, 'fixture.txt')], {
		encoding: 'utf8',
	});
	t.is(result.status, 1);
	t.is((result.stdout ?? '').trimEnd(), 'no');
});
