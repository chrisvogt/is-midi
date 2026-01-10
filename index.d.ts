/**
 * Check if a Buffer/Uint8Array is a MIDI file.
 * @param buffer - The buffer to check (only first 4 bytes needed)
 * @returns True if the buffer is a MIDI file
 */
export default function isMidi(buffer: Uint8Array): boolean;
