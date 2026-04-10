#!/usr/bin/env node
import {Buffer} from 'node:buffer';
import {open} from 'node:fs/promises';
import process from 'node:process';
import isMidi, {isMidiHeaderPlausible, MIN_BYTES_TO_SNIFF, sniffMidi} from './index.js';

function printHelp() {
	process.stderr.write(`
Usage:
  is-midi [--plausible] [--print] <file>
  is-midi [--plausible] [--print] < <file>

Options:
  --plausible  Require a plausible SMF header or RIFF size (stricter than default).
  --print      Print format (smf, rmi, or no) to stdout; exit code still reflects match.
  -h, --help   Show this message.
`.trimStart());
}

/**
 * @param {number} maxBytes
 * @returns {Promise<Uint8Array>}
 */
async function readStdinPrefix(maxBytes) {
	const chunks = [];
	let total = 0;

	for await (const chunk of process.stdin) {
		/** @type {Buffer} */
		const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		chunks.push(buf);
		total += buf.length;
		if (total >= maxBytes) {
			break;
		}
	}

	const joined = Buffer.concat(chunks);
	const slice = joined.subarray(0, Math.min(joined.length, maxBytes));
	return new Uint8Array(slice.buffer, slice.byteOffset, slice.byteLength);
}

/**
 * @param {string} path
 * @param {number} length
 * @returns {Promise<Uint8Array>}
 */
async function readFilePrefix(path, length) {
	const handle = await open(path, 'r');
	try {
		const buffer = new Uint8Array(length);
		const {bytesRead} = await handle.read(buffer, 0, length, 0);
		return buffer.subarray(0, bytesRead);
	} finally {
		await handle.close();
	}
}

function parseArgs(argv) {
	let plausible = false;
	let print = false;
	const positional = [];

	for (const arg of argv) {
		switch (arg) {
			case '--plausible': {
				plausible = true;
				break;
			}

			case '--print': {
				print = true;
				break;
			}

			case '-h':
			case '--help': {
				return {
					help: true,
					plausible: false,
					print: false,
					file: null,
				};
			}

			default: {
				if (arg.startsWith('-')) {
					process.stderr.write(`Unknown option: ${arg}\n`);
					process.exit(2);
				}

				positional.push(arg);
			}
		}
	}

	if (positional.length > 1) {
		process.stderr.write('Too many arguments. Expected at most one file path.\n');
		process.exit(2);
	}

	return {
		help: false,
		plausible,
		print,
		file: positional[0] ?? null,
	};
}

const sniffBytes = Math.max(MIN_BYTES_TO_SNIFF, 14);
const args = parseArgs(process.argv.slice(2));

if (args.help) {
	printHelp();
	process.exit(0);
}

const check = args.plausible ? isMidiHeaderPlausible : isMidi;

const prefix = args.file === null
	? await readStdinPrefix(sniffBytes)
	: await readFilePrefix(args.file, sniffBytes);

const ok = check(prefix);

if (args.print) {
	if (ok) {
		const sniffed = sniffMidi(prefix);
		process.stdout.write(`${sniffed ? sniffed.format : 'no'}\n`);
	} else {
		process.stdout.write('no\n');
	}
}

process.exit(ok ? 0 : 1);
