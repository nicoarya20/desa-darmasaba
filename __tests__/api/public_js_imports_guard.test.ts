// @vitest-environment node
// PENJAGA bundel JS situs publik (juknis 5.4 kecepatan, skor mobile). Membaca SEMUA *.ts/*.tsx di
// src/app/(public) dan src/components (kecuali admin) supaya impor yang menambah byte JS langsung merah:
//  1. Pustaka animasi: `framer-motion` dan `motion` adalah SATU pustaka (motion/react = re-export framer-motion),
//     ±158 KB min / ±52 KB gzip. Situs publik saat ini tidak memakainya sama sekali (animasi = CSS/Mantine).
//     Dilarang ada dua jalur impor berbeda, dan impor baru wajib masuk daftar pengecualian bersama alasannya.
//  2. lodash: `import _ from 'lodash'` membawa seluruh pustaka (±74 KB min / ±27 KB gzip); wajib per-fungsi
//     (`lodash/startCase`). Next hanya memecah impor bernama, bukan impor default/namespace.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import lodash from 'lodash';
import startCaseFn from 'lodash/startCase';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const SCAN_DIRS = ['src/app/(public)', 'src/components'];
const SKIP_DIRS = new Set(['src/components/admin']);

/** Pengecualian impor animasi (tambah HANYA atas keputusan user; satu jalur impor saja untuk seluruh situs publik). */
const ANIMATION_EXCEPTIONS: { file: string; specifier: string; reason: string }[] = [];

const ANIMATION_SPECIFIER = /^(framer-motion|motion)(\/.*)?$/;

type ImportRef = { specifier: string; line: number };

/** Semua spesifier impor runtime (static import/export-from, import(), require) tanpa `import type`. */
function runtimeImports(source: string): ImportRef[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/gm, '');
  const refs: ImportRef[] = [];
  const patterns = [
    /(?:^|[\n;])\s*(?:import|export)\s+(?!type\b)[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/g,
    /(?:^|[\n;])\s*import\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of patterns) {
    for (const m of code.matchAll(re)) {
      refs.push({ specifier: m[1], line: code.slice(0, m.index).split('\n').length });
    }
  }
  return refs;
}

function sourceFiles(dir: string): string[] {
  const rel = path.relative(ROOT, dir);
  if (SKIP_DIRS.has(rel)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

function publicImports() {
  return SCAN_DIRS.flatMap((d) => sourceFiles(path.join(ROOT, d))).flatMap((file) =>
    runtimeImports(readFileSync(file, 'utf8')).map((ref) => ({ ...ref, file: path.relative(ROOT, file) })),
  );
}

describe('parser impor (potongan sintetis)', () => {
  it('menangkap import statis, bernama, default, namespace, side-effect, dinamis, require, dan export-from', () => {
    const src = [
      `import { motion } from "framer-motion";`,
      `import * as m from 'motion/react'`,
      `import _ from 'lodash';`,
      `import 'motion/mini';`,
      `export { x } from "motion";`,
      `const a = await import("framer-motion");`,
      `const b = require('lodash');`,
      `import {\n  AnimatePresence,\n  motion,\n} from 'framer-motion';`,
    ].join('\n');
    expect(runtimeImports(src).map((r) => r.specifier).sort()).toEqual(
      ['framer-motion', 'framer-motion', 'framer-motion', 'lodash', 'lodash', 'motion', 'motion/mini', 'motion/react'].sort(),
    );
  });

  it('mengabaikan import type, komentar, dan impor lodash per-fungsi', () => {
    const src = [
      `import type { Variants } from "framer-motion";`,
      `// import { motion } from "framer-motion";`,
      `/* import _ from 'lodash'; */`,
      `import startCase from "lodash/startCase";`,
      `import { Box } from "@mantine/core";`,
    ].join('\n');
    expect(runtimeImports(src).map((r) => r.specifier)).toEqual(['lodash/startCase', '@mantine/core']);
  });

  it('pola spesifier animasi tidak menyeret paket lain yang diawali "motion"', () => {
    expect(ANIMATION_SPECIFIER.test('framer-motion')).toBe(true);
    expect(ANIMATION_SPECIFIER.test('motion/react')).toBe(true);
    expect(ANIMATION_SPECIFIER.test('motion')).toBe(true);
    expect(ANIMATION_SPECIFIER.test('motion-utils')).toBe(false);
    expect(ANIMATION_SPECIFIER.test('react-motion')).toBe(false);
  });
});

describe('bundel situs publik', () => {
  const imports = publicImports();

  it('memindai berkas sumber publik (bukan daftar kosong yang lolos diam-diam)', () => {
    expect(new Set(imports.map((i) => i.file)).size).toBeGreaterThan(200);
  });

  it('tidak ada impor pustaka animasi di luar daftar pengecualian', () => {
    const allowed = new Set(ANIMATION_EXCEPTIONS.map((e) => `${e.file}|${e.specifier}`));
    const offenders = imports
      .filter((i) => ANIMATION_SPECIFIER.test(i.specifier) && !allowed.has(`${i.file}|${i.specifier}`))
      .map((i) => `${i.file}:${i.line} -> ${i.specifier}`);
    expect(offenders, 'Impor animasi baru di situs publik menambah ±52 KB gzip; minta keputusan user dulu.').toEqual([]);
  });

  it('hanya ada satu jalur impor animasi (framer-motion dan motion/react tidak boleh bercampur)', () => {
    const paths = new Set(imports.filter((i) => ANIMATION_SPECIFIER.test(i.specifier)).map((i) => i.specifier));
    expect([...paths].length).toBeLessThanOrEqual(1);
  });

  it('setiap pengecualian animasi punya alasan dan benar-benar dipakai', () => {
    for (const e of ANIMATION_EXCEPTIONS) {
      expect(e.reason.length).toBeGreaterThan(10);
      expect(imports.some((i) => i.file === e.file && i.specifier === e.specifier)).toBe(true);
    }
  });

  it('lodash hanya diimpor per-fungsi (lodash/xxx), tidak pernah dari "lodash" utuh', () => {
    const offenders = imports.filter((i) => i.specifier === 'lodash').map((i) => `${i.file}:${i.line}`);
    expect(offenders, 'Pakai `import fn from "lodash/fn"` atau fungsi native.').toEqual([]);
  });
});

describe('lodash/startCase identik dengan _.startCase (beranda: nama layanan)', () => {
  const samples = [
    'surat-keterangan',
    'penduduk_non_permanen',
    'perizinanBerusaha',
    'telunjuk sakti desa',
    'SURAT KETERANGAN USAHA',
    'ajukan--permohonan  baru',
    'KTP & KK 2026',
    'Pelayanan Administrasi',
    '',
    '   ',
  ];

  it.each(samples)('menghasilkan keluaran sama untuk %j', (input) => {
    expect(startCaseFn(input)).toBe(lodash.startCase(input));
  });

  it('mengubah slug menjadi judul seperti sebelumnya (nilai nyata, bukan sekadar sama)', () => {
    expect(startCaseFn('surat-keterangan')).toBe('Surat Keterangan');
    expect(startCaseFn('perizinanBerusaha')).toBe('Perizinan Berusaha');
  });

  it('beranda memakai lodash/startCase dan tidak lagi memuat lodash utuh', () => {
    const file = path.join(ROOT, 'src/app/(public)/_com/main-page/layanan-potensi/index.tsx');
    const specs = runtimeImports(readFileSync(file, 'utf8')).map((i) => i.specifier);
    expect(specs).toContain('lodash/startCase');
    expect(specs).not.toContain('lodash');
  });
});
