// bun macro
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function readBlocksPy() {
  return [
    {
      id: 'blocks/__init__.mpy',
      content: arrayBufferToBase64(readFileSync(resolve(__dirname, '../lib/mpy/__init__.mpy'))),
    },
    {
      id: 'blocks/runtime.mpy',
      content: arrayBufferToBase64(readFileSync(resolve(__dirname, '../lib/mpy/runtime.mpy'))),
    },
  ];
}
