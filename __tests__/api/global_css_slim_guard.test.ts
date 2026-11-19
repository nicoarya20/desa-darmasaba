// @vitest-environment node
// PENJAGA CSS global ramping (plan-performance B1+B2). globals.css dimuat render-blocking di SEMUA halaman, jadi:
//  1. globals.css tidak boleh lagi mengimpor animate.css (0 pemakaian) maupun CSS paket ekstensi Mantine /
//     react-simple-toasts (±85 KB mentah, ~98% tak terpakai di beranda).
//  2. Layout admin wajib mengimpor CSS ekstensi itu (semua rute /admin/* ada di bawahnya).
//  3. Di luar admin, file yang memakai komponen ekstensi wajib mengimpor CSS paketnya sendiri; tanpa itu komponen
//     tampil rusak (docs Mantine: "Do not forget to import styles"). Termasuk editor admin yang dipakai halaman
//     publik (createEditor / PPIDTextEditor = @mantine/tiptap): pemakai publiknya yang mengimpor CSS tiptap.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const SRC = path.join(ROOT, 'src');
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');

/** Paket ekstensi yang CSS-nya dipindah keluar dari globals.css, beserta file CSS-nya. */
const EXTENSION_CSS = {
  '@mantine/charts': '@mantine/charts/styles.css',
  '@mantine/dates': '@mantine/dates/styles.css',
  '@mantine/dropzone': '@mantine/dropzone/styles.css',
  '@mantine/tiptap': '@mantine/tiptap/styles.css',
} as const;
type ExtensionPkg = keyof typeof EXTENSION_CSS;

const ADMIN_CSS = [
  ...Object.values(EXTENSION_CSS),
  'react-simple-toasts/dist/style.css',
  'react-simple-toasts/dist/theme/dark.css',
];

/** Spesifier @import di file CSS (komentar dibuang supaya catatan di komentar tidak terhitung). */
function cssImports(source: string): string[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...code.matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

/** Spesifier impor runtime JS/TS (tanpa `import type`, tanpa komentar). */
function runtimeImports(source: string): string[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const patterns = [
    /(?:^|[\n;])\s*(?:import|export)\s+(?!type\b)[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/g,
    /(?:^|[\n;])\s*import\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  return patterns.flatMap((re) => [...code.matchAll(re)].map((m) => m[1]));
}

const pkgOf = (specifier: string): ExtensionPkg | null =>
  (Object.keys(EXTENSION_CSS) as ExtensionPkg[]).find((p) => specifier === p || specifier.startsWith(`${p}/`)) ?? null;

/** Paket ekstensi yang dipakai sebagai komponen (CSS-nya sendiri tidak dihitung). */
const usedPackages = (imports: string[]) =>
  new Set(imports.filter((s) => !s.endsWith('.css')).map(pkgOf).filter((p): p is ExtensionPkg => p !== null));

function resolveAlias(specifier: string): string | null {
  if (!specifier.startsWith('@/')) return null;
  const base = path.join(SRC, specifier.slice(2));
  const candidates = [base, `${base}.tsx`, `${base}.ts`, path.join(base, 'index.tsx'), path.join(base, 'index.ts')];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

/** Semua file di src/app di luar admin & api (dibungkus layout root saja, bukan layout admin). */
const nonAdminFiles = () =>
  sourceFiles(path.join(SRC, 'app')).filter((f) => {
    const rel = path.relative(SRC, f);
    return !rel.startsWith(`app${path.sep}admin${path.sep}`) && !rel.startsWith(`app${path.sep}api${path.sep}`);
  });

describe('parser impor (potongan sintetis)', () => {
  it('membaca @import CSS dan mengabaikan komentar', () => {
    expect(cssImports('/* @import "animate.css"; */\n@import "./a.css";\n@import url("b.css");')).toEqual(['./a.css', 'b.css']);
  });

  it('impor JS: abaikan import type & komentar, baca impor efek samping CSS', () => {
    const src = "// import 'x';\nimport type { A } from '@mantine/dates';\nimport { B } from '@mantine/charts';\nimport '@mantine/charts/styles.css';";
    expect(runtimeImports(src)).toEqual(['@mantine/charts', '@mantine/charts/styles.css']);
    expect([...usedPackages(runtimeImports(src))]).toEqual(['@mantine/charts']);
  });
});

describe('globals.css ramping', () => {
  const imports = cssImports(read('src/app/globals.css'));

  it('tidak mengimpor animate.css, CSS ekstensi Mantine, atau react-simple-toasts', () => {
    const banned = imports.filter((s) => /^(animate\.css|@mantine\/(charts|dates|dropzone|tiptap)|react-simple-toasts)/.test(s));
    expect(banned).toEqual([]);
  });

  it('masih mengimpor token tema (penjaga agar test tidak lolos karena file kosong)', () => {
    expect(imports).toContain('./theme-tokens.css');
  });
});

describe('layout admin', () => {
  it('mengimpor semua CSS ekstensi yang dipindah dari globals.css', () => {
    const imports = runtimeImports(read('src/app/admin/layout.tsx'));
    expect(ADMIN_CSS.filter((css) => !imports.includes(css))).toEqual([]);
  });
});

describe('pemakai komponen ekstensi di luar admin mengimpor CSS-nya sendiri', () => {
  it('impor langsung atau lewat komponen admin (satu tingkat) disertai styles.css paketnya', () => {
    const missing: string[] = [];
    for (const file of nonAdminFiles()) {
      const imports = runtimeImports(readFileSync(file, 'utf8'));
      const needed = usedPackages(imports);
      for (const spec of imports.filter((s) => s.startsWith('@/app/admin/') || s.startsWith('@/components/admin/'))) {
        const target = resolveAlias(spec);
        if (target) usedPackages(runtimeImports(readFileSync(target, 'utf8'))).forEach((p) => needed.add(p));
      }
      for (const pkg of needed) {
        if (!imports.includes(EXTENSION_CSS[pkg])) missing.push(`${path.relative(ROOT, file)} → ${EXTENSION_CSS[pkg]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
