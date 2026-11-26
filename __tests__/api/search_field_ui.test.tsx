// @vitest-environment node
// Kolom cari bersama situs publik (`_com/search-field/SearchField`) + penjaga "satu komponen cari & paginasi".
// jsdom rusak di repo ini → markup via renderToStaticMarkup; klik tombol "x" (kosongkan + fokus) tidak teruji di sini.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a data-transition="" {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));
vi.mock('next/navigation', () => ({ usePathname: () => '/pemerintahan/produk-hukum' }));

import { KabarListHeader, type KabarListTab } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { SearchField } from '@/app/(public)/_com/search-field/SearchField';
import s from '@/app/(public)/_com/search-field/search-field.module.css';
import { SEARCH_FIELD_TEXT } from '@/app/(public)/_com/search-field/search-field.text';

const PUBLIC_DIR = path.resolve(__dirname, '../../src/app/(public)');
const PUB = (rel: string) => readFileSync(path.join(PUBLIC_DIR, rel), 'utf8');
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const noop = () => {};

const field = (value: string, extra: { fullWidth?: boolean } = {}) =>
  render(<SearchField value={value} onChange={noop} label="Cari surat" placeholder="Cari surat…" {...extra} />);

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return tsxFiles(full);
    return name.endsWith('.tsx') ? [full] : [];
  });
}

describe('SearchField', () => {
  it('kosong → form role=search, input type=search berlabel sr-only, tanpa tombol "x"', () => {
    const html = field('');
    expect(html).toContain('role="search"');
    expect(html).toContain('type="search"');
    expect(html).toContain('placeholder="Cari surat…"');
    const id = html.match(/<input[^>]*id="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`for="${id}" class="${s.srOnly}">Cari surat</label>`);
    expect(html).not.toContain('<button');
    expect(html).not.toContain(SEARCH_FIELD_TEXT.clear);
  });

  it('ada isi → tombol "x" type=button dengan aria-label "Hapus pencarian"', () => {
    const html = field('akta');
    expect(html).toContain('value="akta"');
    const button = html.match(/<button[^>]*>/)?.[0] ?? '';
    expect(button).toContain('type="button"');
    expect(button).toContain(`aria-label="${SEARCH_FIELD_TEXT.clear}"`);
    expect(SEARCH_FIELD_TEXT.clear).toBe('Hapus pencarian');
  });

  it('fullWidth → kelas selebar wadah; bawaan tanpa kelas itu', () => {
    expect(field('', { fullWidth: true })).toContain(`class="${s.root} ${s.fullWidth}"`);
    expect(field('')).not.toContain(s.fullWidth);
  });

  it('CSS menyembunyikan "x" bawaan browser dan hanya memakai token/alias tema', () => {
    const css = PUB('_com/search-field/search-field.module.css');
    expect(css).toMatch(/::-webkit-search-cancel-button[\s\S]*?\{[^}]*-webkit-appearance:\s*none;[^}]*display:\s*none;/);
    expect(css).toMatch(/::-ms-clear\s*\{[^}]*display:\s*none;/);
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/#[0-9a-f]{3,6}\b/i);
  });
});

describe('KabarListHeader memakai SearchField', () => {
  const header = (search: string, tabs: KabarListTab[] = []) =>
    render(
      <KabarListHeader
        title="Berita"
        lead="Pengantar"
        searchLabel="Cari berita"
        searchPlaceholder="Cari berita"
        kategoriLabel="Kategori"
        tabs={tabs}
        search={search}
        onSearch={noop}
      />,
    );

  it('kolom cari = kelas SearchField; tombol "x" hanya saat URL berisi kata kunci', () => {
    expect(header('')).toContain(`class="${s.input}"`);
    expect(header('')).not.toContain(SEARCH_FIELD_TEXT.clear);
    expect(header('pura')).toContain(`aria-label="${SEARCH_FIELD_TEXT.clear}"`);
  });

  it('pil query-saja = next/link (tanpa transisi); pil ganti path = Link next-view-transitions', () => {
    const html = header('', [
      { key: 'semua', href: '/pemerintahan/produk-hukum', label: 'Semua', active: true },
      { key: 'perdes', href: '/pemerintahan/produk-hukum?kategori=perdes', label: 'Perdes', active: false },
      { key: 'lain', href: '/pemerintahan/berita/semua', label: 'Berita', active: false },
    ]);
    const anchor = (label: string) => html.match(new RegExp(`<a[^>]*>${label}</a>`))?.[0] ?? '';
    expect(anchor('Semua')).not.toContain('data-transition');
    expect(anchor('Semua')).toContain('aria-current="page"');
    expect(anchor('Perdes')).not.toContain('data-transition');
    expect(anchor('Perdes')).toContain('href="/pemerintahan/produk-hukum?kategori=perdes"');
    expect(anchor('Berita')).toContain('data-transition');
  });
});

describe('Penjaga: satu kolom cari & satu paginasi di situs publik', () => {
  const files = tsxFiles(PUBLIC_DIR).map((file) => ({ rel: path.relative(PUBLIC_DIR, file), src: readFileSync(file, 'utf8') }));

  it('<Pagination> Mantine hanya di KabarListPagination', () => {
    const users = files.filter((f) => f.src.includes('<Pagination')).map((f) => f.rel);
    expect(users).toEqual([path.join('_com', 'kabar-list', 'KabarListPagination.tsx')]);
  });

  it('tidak ada TextInput Mantine berikon kaca pembesar (kolom cari lama)', () => {
    const users = files.filter((f) => f.src.includes('<TextInput') && f.src.includes('IconSearch')).map((f) => f.rel);
    expect(users).toEqual([]);
  });

  it('LayananSearch sudah dihapus dan tidak diimpor lagi', () => {
    expect(files.filter((f) => f.src.includes('LayananSearch')).map((f) => f.rel)).toEqual([]);
  });

  it('gaya pil kolom cari tidak diduplikasi di kabar-list / layanan', () => {
    expect(PUB('_com/kabar-list/kabar-list.module.css')).not.toContain('.searchInput');
    expect(PUB('(pages)/pemerintahan/layanan/_com/layanan.module.css')).not.toContain('.searchInput');
  });
});
