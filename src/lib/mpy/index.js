import { readBlocksPy } from '../../macros/mpy' with { type: 'macro' };

const base64ToArrayBuffer = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
};

const mpy = readBlocksPy();

export default mpy.map((file) => ({
  id: file.id,
  content: base64ToArrayBuffer(file.content),
}));
