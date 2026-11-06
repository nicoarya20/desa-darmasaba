import { readdirSync } from 'node:fs';
import path from 'node:path';

const DARMASABA_DIR = path.resolve(__dirname, '../../src/app/darmasaba');

/** Daftar route publik (segmen URL) dari page.tsx di src/app/darmasaba; route group `(x)` dibuang. */
export function publicRoutes(): string[][] {
  const files = readdirSync(DARMASABA_DIR, { recursive: true, encoding: 'utf8' })
    .filter((f) => path.basename(f) === 'page.tsx');
  return files.map((f) => [
    'darmasaba',
    ...path.dirname(f).split(path.sep).filter((s) => s !== '.' && !/^\(.*\)$/.test(s)),
  ]);
}

/** Cocokkan URL ke route nyata. Segmen dinamik `[x]` match apa saja, kecuali placeholder `[sub]`. */
export function matchesRealPage(url: string, routes: string[][]): boolean {
  const segs = url.split('?')[0].split('/').filter(Boolean);
  return routes.some(
    (route) =>
      route.length === segs.length &&
      route.every((r, i) => (/^\[.+\]$/.test(r) ? r !== '[sub]' : r === segs[i])),
  );
}
