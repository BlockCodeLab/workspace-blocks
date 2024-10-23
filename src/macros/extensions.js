// bun macro
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';

export function readExtensions() {
  return readdirSync(resolve(import.meta.dir, '../../../../extensions'), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    })
    .map((dirent) => dirent.name);
}
