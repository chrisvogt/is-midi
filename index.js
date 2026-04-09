/**
 * Check if a Buffer/Uint8Array is a MIDI file.
 * Detects standard MIDI files (magic bytes "MThd") and
 * RIFF-wrapped MIDI files (.rmi, magic bytes "RIFF????RMID").
 * @param {Uint8Array} buffer - The buffer to check
 * @returns {boolean} True if the buffer is a MIDI file
 */
export default function isMidi(buffer) {
	if (!buffer || buffer.length < 4) {
		return false;
	}

	// Check for "MThd" magic bytes (standard MIDI)
	if (
		buffer[0] === 0x4D // M
		&& buffer[1] === 0x54 // T
		&& buffer[2] === 0x68 // H
		&& buffer[3] === 0x64 // D
	) {
		return true;
	}

	// Check for RIFF-wrapped MIDI (.rmi): "RIFF" + 4-byte size + "RMID"
	if (
		buffer.length >= 12
		&& buffer[0] === 0x52 // R
		&& buffer[1] === 0x49 // I
		&& buffer[2] === 0x46 // F
		&& buffer[3] === 0x46 // F
		&& buffer[8] === 0x52 // R
		&& buffer[9] === 0x4D // M
		&& buffer[10] === 0x49 // I
		&& buffer[11] === 0x44 // D
	) {
		return true;
	}

	return false;
}
