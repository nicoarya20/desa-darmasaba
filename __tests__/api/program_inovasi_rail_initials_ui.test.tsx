// @vitest-environment node
// Rel Program Inovasi di hero beranda: ubin tanpa logo menampilkan inisial nama (bukan ikon foto),
// dan tema gelap memakai varian C (ubin terang penuh, tanpa pelat logo di dalam ubin).
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup; onError (logo gagal muat) dicek manual.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  HeroPrograms,
  type ProgramInovasiItem,
} from '@/app/(public)/_com/main-page/landing-page/HeroPrograms';
import p from '@/app/(public)/_com/main-page/landing-page/programs.module.css';

const render = (items: ProgramInovasiItem[]) =>
  renderToStaticMarkup(
    <MantineProvider>
      <HeroPrograms items={items} loading={false} onOpen={vi.fn()} />
    </MantineProvider>,
  );

// test-only: bentuk minimal item program
const item = (id: string, name: string, link: string | null) =>
  ({ id, name, image: link ? { link } : null }) as unknown as ProgramInovasiItem;

describe('HeroPrograms: pengganti logo', () => {
  it('ubin tanpa logo menampilkan inisial nama, tersembunyi dari pembaca layar', () => {
    const html = render([item('a', 'Bicara Darmasaba', null), item('b', 'PDKT', null)]);
    expect(html).toContain(`<span class="${p.tileInitials}" aria-hidden="true">BD</span>`);
    expect(html).toContain(`<span class="${p.tileInitials}" aria-hidden="true">PDKT</span>`);
    expect(html).not.toContain('tabler-icon-photo-off');
    // Nama tetap dibaca lewat teks ubin.
    expect(html).toContain('Bicara Darmasaba</span>');
  });

  it('ubin dengan logo merender gambar, bukan inisial', () => {
    const html = render([item('c', 'Bares', '/api/img/bares.webp')]);
    expect(html).toContain('src="/api/img/bares.webp"');
    expect(html).not.toContain(`class="${p.tileInitials}"`);
  });
});

describe('programs.module.css: tema gelap varian C', () => {
  const css = readFileSync(
    path.resolve(__dirname, '../../src/app/(public)/_com/main-page/landing-page/programs.module.css'),
    'utf8',
  );
  /** Blok yang selektornya persis `selector` (bukan bagian daftar selektor gabungan seperti `.a,\n.b {`). */
  const block = (selector: string) => {
    let start = css.indexOf(`\n${selector} {`);
    while (start > 0 && css.slice(0, start).trimEnd().endsWith(',')) start = css.indexOf(`\n${selector} {`, start + 1);
    expect(start, `selektor ${selector} tidak ditemukan`).toBeGreaterThanOrEqual(0);
    let depth = 0;
    for (let i = css.indexOf('{', start); i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
    }
    throw new Error(`blok ${selector} tidak tertutup`);
  };

  it('ubin gelap = permukaan terang polos dengan teks gelap (pulau terang, tanpa light-dark)', () => {
    const tile = block('.tile');
    const dark = tile.slice(tile.indexOf('@mixin dark'));
    expect(dark).toMatch(/background:\s*#d9e1ea/i);
    expect(dark).toMatch(/color:\s*#1d1d1f/i);
    expect(dark).not.toContain('light-dark(');
  });

  it('pelat logo di dalam ubin sudah dihapus (tidak ada kotak dalam kotak)', () => {
    expect(css).not.toMatch(/\.tileLogo\s*\{\s*@mixin dark/);
    expect(css).not.toContain('tileLogoEmpty');
  });

  it('inisial: 72px, 600, brand; gelap brand terang polos karena ubin terang', () => {
    const initials = block('.tileInitials');
    expect(initials).toMatch(/font-size:\s*28px/);
    expect(initials).toMatch(/font-weight:\s*600/);
    expect(initials).toMatch(/color:\s*var\(--brand\)/);
    expect(initials.slice(initials.indexOf('@mixin dark'))).toMatch(/color:\s*#0a4e78/i);
    expect(css).toMatch(/\.tile \.tileLogo,\s*\n\.tileInitials \{[^}]*height:\s*72px/);
  });
});
