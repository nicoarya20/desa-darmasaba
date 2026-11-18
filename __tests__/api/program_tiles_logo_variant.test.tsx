// @vitest-environment node
// Ubin program bersama, varian ber-logo (Program Inovasi): kelas `.tileLogo` hanya untuk item ber-logo/inisial
// (ubin ikon Program Kreatif & Penghijauan tidak berubah), pelat logo/inisial, dan CSS pulau terang gelap (varian C)
// tanpa light-dark(). jsdom rusak di repo ini, jadi renderToStaticMarkup + baca CSS sumber.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { ProgramTiles, type ProgramTileItem } from '@/app/(public)/_com/program-tiles/ProgramTiles';
import s from '@/app/(public)/_com/program-tiles/program-tiles.module.css';

const render = (items: ProgramTileItem[]) =>
  renderToStaticMarkup(
    <MantineProvider env="test">
      <ProgramTiles items={items} label="Daftar" moreLabel="Selengkapnya" />
    </MantineProvider>,
  ).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: item fiktif.
const base = { summary: 'Ringkasan', href: '/p/1' };
const CSS = readFileSync(
  path.resolve(__dirname, '../../src/app/(public)/_com/program-tiles/program-tiles.module.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('ProgramTiles: varian ber-logo', () => {
  it('ubin ikon / tanpa ikon tetap kelas lama, tanpa pelat logo dan tanpa pembungkus teks', () => {
    const html = render([
      { ...base, id: 'a', title: 'Kreatif', icon: 'ekowisata' },
      { ...base, id: 'b', title: 'Polos' },
    ]);
    expect(html).not.toContain(s.tileLogo);
    expect(html).not.toContain(`class="${s.logo}"`);
    expect(html).not.toContain(`class="${s.text}"`);
    expect(html).toContain(`<a href="/p/1" class="${s.tile} ${r.trigger}"><span class="${s.icon}" aria-hidden="true">`);
  });

  it('logo → .tileLogo, pelat berisi img alt kosong, judul + ringkasan dibungkus .text', () => {
    const html = render([{ ...base, id: 'a', title: 'Bares', logo: '/api/img/bares', initials: 'B' }]);
    expect(html).toContain(`class="${s.tile} ${s.tileLogo} ${r.trigger}"`);
    expect(html).toMatch(new RegExp(`<span class="${s.logo}"><img[^>]*src="/api/img/bares"[^>]*></span>`));
    expect(html).toMatch(/<img[^>]*alt=""/);
    expect(html).not.toContain(s.initials);
    expect(html).toMatch(new RegExp(`<div class="${s.text}"><h3 class="${s.title}">.*Bares.*</h3><span class="${s.summary}">Ringkasan</span></div>`));
  });

  it('tanpa logo, ada inisial → pelat inisial aria-hidden; logo diutamakan atas ikon', () => {
    const html = render([{ ...base, id: 'a', title: 'PDKT', initials: 'PDKT', icon: 'ekowisata' }]);
    expect(html).toContain(`class="${s.tile} ${s.tileLogo} ${r.trigger}"`);
    expect(html).toContain(`<span class="${s.logo}"><span class="${s.initials}" aria-hidden="true">PDKT</span></span>`);
    expect(html).not.toContain(`class="${s.icon}"`);
  });

  it('inisial kosong tanpa logo → ubin biasa (bukan varian ber-logo)', () => {
    expect(render([{ ...base, id: 'a', title: 'X', initials: '' }])).not.toContain(s.tileLogo);
  });
});

describe('program-tiles.module.css: pelat rata tinggi, gelap varian C, baris ponsel', () => {
  it('pelat logo 16:9 dengan gambar absolut (tinggi asli gambar tidak melebarkan pelat)', () => {
    expect(CSS).toMatch(/\.logo \{[^}]*position: relative;[^}]*aspect-ratio: 16 \/ 9;/);
    expect(CSS).toMatch(/\.logo \.logoImg \{\s*position: absolute;/);
  });

  it('pulau terang tanpa light-dark(); alias nilai polos terang di @mixin dark .tileLogo', () => {
    expect(CSS).not.toContain('light-dark(');
    const island = CSS.slice(CSS.indexOf('.tileLogo {'), CSS.indexOf('\n}', CSS.indexOf('.tileLogo {')));
    expect(island).toMatch(/@mixin dark \{\s*--tile: #d9e1ea;\s*--ink: #1d1d1f;\s*--muted: #515154;\s*--brand: #0a4e78;\s*\}/);
    expect(CSS).toMatch(/\.tileLogo \.title > span \{\s*@mixin dark \{\s*--reveal-to: #0a4e78;/);
    expect(CSS).toMatch(/\.tileLogo \.more > span \{\s*@mixin dark \{\s*--reveal-to: #1c6ea4;/);
  });

  it('cincin fokus ubin ber-logo di gelap memakai brand tema (digambar di atas latar halaman, bukan di pulau)', () => {
    expect(CSS).toMatch(/\.tileLogo:focus-visible \{\s*@mixin dark \{\s*outline-color: var\(--c-brand\);/);
  });

  it('ponsel ≤734px: hanya .tileLogo yang jadi baris dengan pelat 88px; aturan .tile ponsel tetap', () => {
    const mobile = CSS.slice(CSS.indexOf('@media (max-width: 734px)'));
    expect(mobile).toMatch(/\.tileLogo \{\s*flex-direction: row;/);
    expect(mobile).toMatch(/\.tileLogo \.logo \{[^}]*width: 88px;\s*height: 88px;/);
    expect(mobile).toMatch(/\.tileLogo \.summary \{[^}]*-webkit-line-clamp: 2;/);
    expect(mobile).toMatch(/  \.tile \{\s*padding: 24px;\s*\}/);
    expect(mobile).not.toMatch(/(^|\n)\s*\.tile \{[^}]*flex-direction/);
  });
});
