// @vitest-environment node
// Halaman Profil PPID: layout 2 kolom seimbang (masukan R&D — ruang kosong di bawah "Riwayat Karir").
// Catatan: environment jsdom gagal start di repo ini, jadi markup diuji via renderToStaticMarkup
// dan aturan sticky dibaca langsung dari file CSS module.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('valtio/utils', () => ({ useProxy: <T,>(x: T) => x }));
vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/profile_ppid/profile_PPID', () => ({
  default: {
    profile: {
      loading: false,
      error: null,
      load: vi.fn(),
      // test-only: profil fiktif berbentuk respons profilePPID.
      data: {
        id: 'ppid-1',
        name: 'Nama Pejabat Uji',
        biodata: '<p>Isi biografi.</p>',
        riwayat: '<ul><li>2021 - 2027: Jabatan uji</li></ul>',
        pengalaman: '<ul><li>2008 - 2010: Organisasi uji</li></ul>',
        unggulan: '<ul><li>Program uji</li></ul>',
        image: null,
      },
    },
  },
}));

import Page from '@/app/(public)/(pages)/ppid/profil-ppid/page';

const PAGE_DIR = path.join(process.cwd(), 'src/app/(public)/(pages)/ppid/profil-ppid');
const css = readFileSync(path.join(PAGE_DIR, 'profil-ppid.module.css'), 'utf8');
const html = renderToStaticMarkup(
  <MantineProvider>
    <Page />
  </MantineProvider>,
);
const SECTIONS = ['Biografi', 'Riwayat Karir', 'Pengalaman Organisasi', 'Program Unggulan'];

/** HTML satu elemen <div> (beserta isinya) yang tag pembukanya memuat `marker`. */
function divContaining(source: string, marker: string): string {
  const start = source.lastIndexOf('<div', source.indexOf(marker));
  const tag = /<div\b|<\/div>/g;
  tag.lastIndex = start;
  let depth = 0;
  for (let m = tag.exec(source); m; m = tag.exec(source)) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return source.slice(start, tag.lastIndex);
  }
  throw new Error(`Elemen untuk marker "${marker}" tidak tertutup`);
}

const grid = divContaining(html, 'mantine-SimpleGrid-root');
const photoColumn = divContaining(html, '_photoColumn_');

describe('Profil PPID — susunan 2 kolom', () => {
  it('grid jadi 2 kolom mulai breakpoint lg (75em), 1 kolom di bawahnya', () => {
    expect(html).toMatch(/--sg-cols:1;\}@media\(min-width: 75em\)\{[^{}]+\{--sg-cols:2;\}\}/);
  });

  it('keempat section berada di dalam grid, berurutan, dan tidak ada salinan di luar grid', () => {
    const idx = SECTIONS.map((title) => grid.indexOf(`>${title}</h3>`));
    idx.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    SECTIONS.forEach((title) => expect(html.split(`>${title}</h3>`)).toHaveLength(2));
  });

  it('kolom foto berisi foto + nama saja; semua section ada di kolom kanan', () => {
    expect(photoColumn).toContain('alt="Foto Pimpinan"');
    expect(photoColumn).toContain('Nama Pejabat Uji');
    SECTIONS.forEach((title) => expect(photoColumn).not.toContain(title));
  });

  it('isi keempat section memakai ukuran huruf yang sama (lg 1.2rem)', () => {
    const bodyFont =
      /\{font-size:1rem;\}@media\(min-width: 62em\)\{[^{}]+\{font-size:1\.1rem;\}\}@media\(min-width: 75em\)\{[^{}]+\{font-size:1\.2rem;\}\}/g;
    expect(grid.match(bodyFont)).toHaveLength(SECTIONS.length);
  });

  it('isi keempat section rata kiri, bukan justify (justify melebarkan celah antarkata di kolom sempit)', () => {
    expect(grid.match(/text-align:left/g)).toHaveLength(SECTIONS.length);
    expect(grid).not.toContain('text-align:justify');
  });
});

describe('Profil PPID — kartu foto sticky', () => {
  const media = css.match(/@media \(min-width: 75em\) \{([\s\S]*?)\n\}/);

  it('sticky hanya aktif di layout 2 kolom (breakpoint yang sama dengan grid)', () => {
    expect(media?.[1]).toMatch(/position: sticky;/);
    expect(media?.[1]).toMatch(/align-self: start;/);
    expect(css.replace(media?.[0] ?? '', '')).not.toMatch(/position:/);
  });

  it('posisi tempel memperhitungkan tinggi navbar desktop', () => {
    expect(css).toMatch(/--profil-photo-sticky-top: calc\(44px \+ 32px\);/);
    expect(media?.[1]).toMatch(/top: var\(--profil-photo-sticky-top\);/);
  });
});
