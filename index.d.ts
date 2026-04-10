/* eslint-disable @typescript-eslint/naming-convention -- public size hints are SCREAMING_SNAKE in JS too */
/** Minimum bytes to recognize a standard MIDI file (`MThd`). */
export const MIN_BYTES_SMF: 4;

/** Minimum bytes to recognize RIFF-wrapped MIDI (`.rmi`). */
export const MIN_BYTES_RMI: 12;

/** Read at least this many bytes to run `sniffMidi` on unknown input. */
export const MIN_BYTES_TO_SNIFF: 12;

export type MidiFormat = 'smf' | 'rmi';

export type MidiSniffResult = {
	format: MidiFormat;
};

/**
 * Detect standard MIDI (`MThd`) or RIFF MIDI (`.rmi`) from the first bytes.
 */
export function sniffMidi(buffer: Uint8Array | undefined): MidiSniffResult | undefined;

/**
 * Stricter check than `isMidi`: validates the SMF header chunk or a sane RIFF size.
 * Needs the first **14** bytes for SMF, **12** for RIFF MIDI.
 */
export function isMidiHeaderPlausible(buffer: Uint8Array | undefined): boolean;

/**
 * Magic-byte check only (fast). Same as `sniffMidi(buffer) !== undefined`.
 */
export default function isMidi(buffer: Uint8Array | undefined): boolean;
