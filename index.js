/**
 * Check if a Buffer/Uint8Array is a MIDI file.
 * MIDI files start with the magic bytes "MThd" (0x4D546864).
 * @param {Uint8Array} buffer - The buffer to check
 * @returns {boolean} True if the buffer is a MIDI file
 */
export default function isMidi(buffer) {
	if (!buffer || buffer.length < 4) {
		return false;
	}

	// Check for "MThd" magic bytes
	return (
		buffer[0] === 0x4D // M
		&& buffer[1] === 0x54 // T
		&& buffer[2] === 0x68 // H
		&& buffer[3] === 0x64 // D
	);
}
