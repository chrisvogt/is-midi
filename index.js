/** Minimum bytes to recognize a standard MIDI file (`MThd`). */
export const MIN_BYTES_SMF = 4;

/** Minimum bytes to recognize RIFF-wrapped MIDI (`.rmi`: `RIFF` … `RMID`). */
export const MIN_BYTES_RMI = 12;

/** Read at least this many bytes to run {@link sniffMidi} on unknown input. */
export const MIN_BYTES_TO_SNIFF = MIN_BYTES_RMI;

/** Largest RIFF payload size accepted by {@link isMidiHeaderPlausible} (~512 MiB). */
const MAX_RIFF_PAYLOAD_PLAUSIBLE = 512 * 1024 * 1024;

/**
 * @param {Uint8Array} u8
 * @param {number} offset
 * @returns {number}
 */
function readUint16BE(u8, offset) {
	const view = new DataView(u8.buffer, u8.byteOffset + offset, 2);
	return view.getUint16(0, false);
}

/**
 * @param {Uint8Array} u8
 * @param {number} offset
 * @returns {number}
 */
function readUint32BE(u8, offset) {
	const view = new DataView(u8.buffer, u8.byteOffset + offset, 4);
	return view.getUint32(0, false);
}

/**
 * @param {Uint8Array} u8
 * @param {number} offset
 * @returns {number}
 */
function readUint32LE(u8, offset) {
	const view = new DataView(u8.buffer, u8.byteOffset + offset, 4);
	return view.getUint32(0, true);
}

/**
 * Detect standard MIDI (`MThd`) or RIFF MIDI (`.rmi`) from the first bytes.
 * @param {Uint8Array | undefined} buffer
 * @returns {{ format: 'smf' | 'rmi' } | undefined}
 */
export function sniffMidi(buffer) {
	if (!buffer || buffer.length < MIN_BYTES_SMF) {
		return undefined;
	}

	// Standard MIDI file ("MThd")
	if (
		buffer[0] === 0x4D // M
		&& buffer[1] === 0x54 // T
		&& buffer[2] === 0x68 // H
		&& buffer[3] === 0x64 // D
	) {
		return {format: 'smf'};
	}

	// RIFF-wrapped MIDI (.rmi): "RIFF" + 4-byte size + "RMID"
	if (
		buffer.length >= MIN_BYTES_RMI
		&& buffer[0] === 0x52 // R
		&& buffer[1] === 0x49 // I
		&& buffer[2] === 0x46 // F
		&& buffer[3] === 0x46 // F
		&& buffer[8] === 0x52 // R
		&& buffer[9] === 0x4D // M
		&& buffer[10] === 0x49 // I
		&& buffer[11] === 0x44 // D
	) {
		return {format: 'rmi'};
	}

	return undefined;
}

/**
 * Stricter check than {@link isMidi}: validates the SMF header chunk or a sane RIFF size.
 * Needs the first **14** bytes for SMF, **12** for RIFF MIDI (same as sniff).
 * @param {Uint8Array | undefined} buffer
 * @returns {boolean}
 */
export function isMidiHeaderPlausible(buffer) {
	const sniffed = sniffMidi(buffer);
	if (!sniffed) {
		return false;
	}

	if (sniffed.format === 'smf') {
		if (buffer.length < 14) {
			return false;
		}

		const headerChunkLength = readUint32BE(buffer, 4);
		if (headerChunkLength !== 6) {
			return false;
		}

		const formatType = readUint16BE(buffer, 8);
		if (formatType > 2) {
			return false;
		}

		const trackCount = readUint16BE(buffer, 10);
		if (trackCount < 1) {
			return false;
		}

		if (formatType === 0 && trackCount !== 1) {
			return false;
		}

		return true;
	}

	// RIFF MIDI — little-endian payload size after "RIFF"
	const riffPayloadSize = readUint32LE(buffer, 4);
	return riffPayloadSize >= 4 && riffPayloadSize <= MAX_RIFF_PAYLOAD_PLAUSIBLE;
}

/**
 * Check if a Buffer/Uint8Array is a MIDI file (magic bytes only).
 * Detects standard MIDI files (`MThd`) and RIFF-wrapped MIDI (`.rmi`).
 * @param {Uint8Array | undefined} buffer - The buffer to check
 * @returns {boolean} True if the buffer is a MIDI file
 */
export default function isMidi(buffer) {
	return sniffMidi(buffer) !== undefined;
}
