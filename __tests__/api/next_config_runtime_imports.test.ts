// @vitest-environment node
// Image Docker (runner) hanya menyalin `src/lib` dan `next.config.*` (lihat Dockerfile). `next start` memuat
// next.config.ts saat runtime, jadi impor relatif ke luar `src/lib` membuat container mati (insiden stg 0.1.307).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const config = readFileSync(join(ROOT, 'next.config.ts'), 'utf8');
const dockerfile = readFileSync(join(ROOT, 'Dockerfile'), 'utf8');

/** Spesifier relatif ("./x", "../x") dari import/require di next.config.ts. */
const relativeImports = [...config.matchAll(/(?:from|require\()\s*["'](\.{1,2}\/[^"']+)["']/g)].map((m) => m[1]);

describe('next.config.ts bisa dimuat di image runner', () => {
  it('mengimpor setidaknya satu berkas lokal (penjaga tidak kosong)', () => {
    expect(relativeImports).toContain('./src/lib/security-headers');
  });

  it('semua impor relatif berada di bawah ./src/lib', () => {
    const luarSrcLib = relativeImports.filter((p) => !p.startsWith('./src/lib/'));
    expect(luarSrcLib).toEqual([]);
  });

  it('Dockerfile runner memang menyalin src/lib (dasar aturan di atas)', () => {
    expect(dockerfile).toMatch(/COPY --from=builder[^\n]*\/app\/src\/lib \.\/src\/lib/);
    expect(dockerfile).not.toMatch(/COPY --from=builder[^\n]*\/app\/src\/con/);
  });
});
