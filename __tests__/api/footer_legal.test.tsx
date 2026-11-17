// @vitest-environment node
// Baris legal footer (FooterLegal, pola apple.com `ac-gf-footer-legal`): hak cipta lalu daftar tautan berpemisah "|".
// Pemisah dibuat CSS, jadi tak ada karakter "|" di markup (tidak dibaca pembaca layar).
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import Footer from '@/app/(public)/_com/Footer';
import { FOOTER_LEGAL_LINKS, FooterLegal } from '@/app/(public)/_com/FooterLegal';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const CSS = readFileSync(path.resolve(__dirname, '../../src/app/(public)/_com/footer-legal.module.css'), 'utf8');

describe('FooterLegal', () => {
  const html = render(<FooterLegal />);

  it('tautan legal saat ini hanya Peta Informasi → /peta-informasi', () => {
    expect(FOOTER_LEGAL_LINKS).toEqual([{ title: 'Peta Informasi', link: '/peta-informasi' }]);
  });

  it('merender hak cipta tahun berjalan lalu daftar <ul> berisi tautan Peta Informasi', () => {
    const year = new Date().getFullYear();
    expect(html).toContain(`© ${year} Desa Darmasaba. Hak cipta dilindungi.`);
    expect(html).toMatch(/<ul[^>]*>\s*<li[^>]*>\s*<a[^>]*href="\/peta-informasi"[^>]*>Peta Informasi<\/a>\s*<\/li>\s*<\/ul>/);
    expect(html.indexOf('Hak cipta dilindungi.')).toBeLessThan(html.indexOf('<ul'));
    expect(html.match(/<li\b/g)).toHaveLength(FOOTER_LEGAL_LINKS.length);
  });

  it('tautan internal tanpa target _blank, tanpa karakter "|" di markup', () => {
    expect(html.match(/<a\b[^>]*>/)?.[0]).not.toContain('target=');
    expect(html.replace(/<[^>]*>/g, '')).not.toContain('|');
  });

  it('pemisah = pseudo-element di antara butir (bukan setelah butir terakhir), ponsel turun ke bawah ≤734px', () => {
    expect(CSS).toMatch(/\.item:not\(:last-child\)::after\s*\{[^}]*content: '';[^}]*width: 1px;[^}]*height: 10px;/);
    expect(CSS).toMatch(/@media \(max-width: 734px\)\s*\{\s*\.legal\s*\{\s*flex-direction: column;/);
  });
});

describe('Footer memakai baris legal', () => {
  const html = render(<Footer />);

  it('Peta Informasi tampil sekali, di baris legal (tidak lagi di grup "Tautan Penting")', () => {
    // Panel accordion ponsel tertutup tak dirender saat SSR, jadi grid desktop "Tautan Penting" ikut terhitung di sini.
    const anchors = html.match(/<a\b[^>]*href="\/peta-informasi"[^>]*>/g) ?? [];
    expect(anchors).toHaveLength(1);
    expect(html).toMatch(/<li[^>]*>\s*<a[^>]*href="\/peta-informasi"[^>]*>Peta Informasi<\/a>\s*<\/li>/);
    expect(html).toContain('Hak cipta dilindungi.');
    expect(html.match(/Hak cipta dilindungi\./g)).toHaveLength(1);
  });
});
