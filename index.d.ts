/**
 * Check if a Buffer/Uint8Array is a MIDI file.
 * Detects standard MIDI files ("MThd") and RIFF-wrapped MIDI files (.rmi).
 * @param buffer - The buffer to check (first 4 bytes needed for standard MIDI, 12 for RIFF MIDI)
 * @returns True if the buffer is a MIDI file
 */
export default function isMidi(buffer: Uint8Array): boolean;
