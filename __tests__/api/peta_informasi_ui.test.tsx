// @vitest-environment node
// Peta Informasi gaya apple.com/sitemap: h1, nav, h2 per menu + ul/li tautan; ikut visibilitas menu efektif.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import PetaInformasi from '@/app/(public)/(tambahan)/peta-informasi/_com/PetaInformasi';
import { PETA_INFORMASI_TEXT } from '@/app/(public)/(tambahan)/peta-informasi/_com/peta-informasi.text';
import { groupPetaInformasi, PETA_INFORMASI_HREF } from '@/app/(public)/(tambahan)/peta-informasi/_lib/petaInformasi';
import { MenuVisibilityProvider } from '@/app/(public)/_com/MenuVisibilityContext';
import { effectiveMenuVisibility } from '@/app/(public)/_com/menu-visibility.logic';
import { flattenMenu } from '@/app/(public)/_com/searchMenu';

const PETA_DIR = path.resolve(__dirname, '../../src/app/(public)/(tambahan)/peta-informasi');
const CCTV = '/keamanan/cctv';
const PUSKESMAS = '/kesehatan/puskesmas'; // default hidden di navbar-list-menu.ts
const DATA_KESEHATAN_GRAFIK = '/kesehatan/data-kesehatan-warga/grafik-penyakit'; // di bawah submenu default-hidden

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const all = (html: string, re: RegExp) => [...html.matchAll(re)].map((m) => decode(m[1]));
const hrefs = (html: string) => all(html, /<a href="([^"]+)"/g);
const h2s = (html: string) => all(html, /<h2[^>]*>([^<]*)<\/h2>/g);

describe('Peta Informasi tanpa override (default config)', () => {
  const html = renderToStaticMarkup(<PetaInformasi />);
  const groups = groupPetaInformasi(flattenMenu(effectiveMenuVisibility({}).searchMenus));

  it('satu h1 "Peta Informasi" yang memberi nama <nav>', () => {
    expect(all(html, /<h1[^>]*>([^<]*)<\/h1>/g)).toEqual([PETA_INFORMASI_TEXT.title]);
    expect(html).toContain('<h1 id="peta-informasi-judul"');
    expect(html).toMatch(/<nav aria-labelledby="peta-informasi-judul"/);
  });

  it('h2 per kelompok sesuai urutan grup, tiap daftar ul dinamai subjudulnya', () => {
    expect(groups.length).toBeGreaterThan(5);
    expect(h2s(html)).toEqual(groups.map((g) => g.name));
    for (const g of groups) {
      const id = `peta-grup-${g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      expect(html, g.name).toContain(`<h2 id="${id}"`);
      expect(html, g.name).toContain(`<ul aria-labelledby="${id}"`);
    }
  });

  it('semua tautan semua kelompok muncul tepat sekali, berurutan, dengan labelnya', () => {
    const expected = groups.flatMap((g) => g.pages);
    expect(hrefs(html)).toEqual(expected.map((p) => p.href));
    for (const p of expected) expect(decode(html), p.href).toContain(`data-text="${p.label}">${p.label}</span>`);
    expect(hrefs(html)).not.toContain(PETA_INFORMASI_HREF);
  });

  it('submenu default-hidden (dan halaman di bawahnya) tidak muncul', () => {
    expect(hrefs(html)).not.toContain(PUSKESMAS);
    expect(hrefs(html)).not.toContain(DATA_KESEHATAN_GRAFIK);
    expect(hrefs(html)).toContain(CCTV);
  });

  it('kolom saring, hitungan, dan tombol kembali lama sudah dibuang; tanpa em dash', () => {
    expect(html).not.toContain('<input');
    expect(html).not.toContain('halaman dalam');
    expect(html).not.toContain('Saring halaman');
    expect(html).not.toContain('—');
  });
});

describe('Peta Informasi dengan override DB (MenuVisibilityProvider)', () => {
  const html = renderToStaticMarkup(
    <MenuVisibilityProvider overrides={{ [CCTV]: false, [PUSKESMAS]: true }}>
      <PetaInformasi />
    </MenuVisibilityProvider>,
  );

  it('submenu yang disembunyikan admin hilang, yang dimunculkan tampil', () => {
    expect(hrefs(html)).not.toContain(CCTV);
    expect(hrefs(html)).toContain(PUSKESMAS);
  });
});

describe('sumber tampilan', () => {
  const view = readFileSync(path.join(PETA_DIR, '_com/PetaInformasiView.tsx'), 'utf8');
  const css = readFileSync(path.join(PETA_DIR, '_com/peta-informasi.module.css'), 'utf8');

  it('tautan = Link next-view-transitions + sapuan warna (.trigger + .cta), tanpa Anchor Mantine', () => {
    expect(view).toMatch(/import \{ Link \} from 'next-view-transitions'/);
    expect(view).toMatch(/<Link href=\{page\.href\} className=\{`\$\{s\.link\} \$\{r\.trigger\}`\}>\s*<span className=\{r\.cta\} data-text=\{page\.label\}>/);
    expect(view).not.toContain('<Anchor');
  });

  it('grid 3 kolom mengalir (multi-column), 1 kolom di ponsel ≤734px, kelompok tidak terbelah', () => {
    expect(css).toMatch(/\.groups \{[^}]*column-count: 3;/);
    expect(css).toMatch(/@media \(max-width: 734px\) \{[\s\S]*\.groups \{\s*column-count: 1;/);
    expect(css).toMatch(/\.group \{[^}]*break-inside: avoid;/);
    expect(css).toContain('var(--edge-gutter)');
  });
});
