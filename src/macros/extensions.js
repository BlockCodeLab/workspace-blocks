// bun macro
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';

export function readExtensions() {
  return readdirSync(resolve(import.meta.dir, '../../../../extensions'), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}
