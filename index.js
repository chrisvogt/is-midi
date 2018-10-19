'use strict';

module.exports = buffer => {
  if (!buffer || buffer.length < 4) {
    return false;
  }

  return buffer[0] === 77 &&
    buffer[1] === 84 &&
    buffer[2] === 104 &&
    buffer[3] === 100;
};
