import test from 'ava';
import readChunk from 'read-chunk';
import isMidi from '.';

const check = filename => isMidi(filename ? readChunk.sync(filename, 0, 4) : '');

test('detects MIDI from Buffer', t => {
  t.true(check('fixture.mid'));
  t.false(check('fixture.wav'));
  t.false(check('fixture.txt'));
  t.false(check());
});
