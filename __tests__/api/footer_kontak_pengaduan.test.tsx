// @vitest-environment node
// Footer publik: blok "Kontak Bupati" (link eksternal tetap), "Portal Badung" ke situs
// resmi Badung, maskot chatbot sudah dihapus, & item "Pengaduan Masyarakat" yang menjadi
// pemicu modal form pengaduan, bukan link halaman.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import Footer from '@/app/darmasaba/_com/Footer';
import { FooterKontakBupati } from '@/app/darmasaba/_com/FooterKontakBupati';
import { KONTAK_BUPATI } from '@/con/kontak-bupati';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const FOOTER_SRC = readFileSync(path.resolve(__dirname, '../../src/app/darmasaba/_com/Footer.tsx'), 'utf8');

const anchorsTo = (html: string, href: string) =>
  html.match(new RegExp(`<a[^>]*href="${href.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"[^>]*>`, 'g')) ?? [];

describe('Footer — Kontak Bupati', () => {
  const LINKS = [
    { label: 'Kontak Bupati Badung', href: 'https://kontak-bupati.badungkab.go.id/' },
    { label: 'LAPOR!', href: 'https://www.lapor.go.id/' },
  ];

  it('data blok berisi judul + tepat dua link eksternal', () => {
    expect(KONTAK_BUPATI.judul).toBe('Kontak Bupati');
    expect(KONTAK_BUPATI.links).toEqual(LINKS);
  });

  it('FooterKontakBupati merender dua link tab baru dengan rel aman, tanpa "Bupati Badung" & badungkab.go.id', () => {
    const html = render(<FooterKontakBupati fz="xs" />);
    for (const { label, href } of LINKS) {
      const anchors = anchorsTo(html, href);
      expect(anchors).toHaveLength(1);
      expect(anchors[0]).toContain('target="_blank"');
      expect(anchors[0]).toContain('rel="noopener noreferrer"');
      expect(html).toContain(`>${label}</a>`);
    }
    expect(html.match(/<a\b/g)).toHaveLength(2);
    expect(html).not.toContain('>Bupati Badung<');
    expect(html).not.toContain('href="https://badungkab.go.id');
    expect(html).not.toContain('>badungkab.go.id<');
  });

  it('Footer merender judul (grid desktop + accordion ponsel) dan isi blok yang sama', () => {
    const html = render(<Footer />);
    // Teks judul (bukan atribut id/aria accordion).
    expect(html.match(/>Kontak Bupati</g)).toHaveLength(2);
    expect(html).not.toContain('>Bupati Badung<');
    // Grid desktop; panel accordion ponsel yang tertutup tidak di-render saat SSR.
    for (const { href } of LINKS) expect(anchorsTo(html, href)).toHaveLength(1);
    // Grid desktop & accordion ponsel memakai komponen isi yang sama.
    expect(FOOTER_SRC).toContain('<FooterKontakBupati fz="xs" />');
    expect(FOOTER_SRC).toContain('<FooterKontakBupati fz="sm" />');
  });
});

describe('Footer — Tautan Penting & slogan', () => {
  it('"Portal Badung" mengarah ke https://badungkab.go.id di tab baru', () => {
    const html = render(<Footer />);
    const anchors = anchorsTo(html, 'https://badungkab.go.id');
    expect(anchors).toHaveLength(1);
    expect(html).toMatch(/<a[^>]*href="https:\/\/badungkab\.go\.id"[^>]*>Portal Badung<\/a>/);
    expect(anchors[0]).toContain('target="_blank"');
    expect(anchors[0]).toContain('rel="noopener noreferrer"');
    expect(html).not.toMatch(/href="\/darmasaba\/pemerintahan\/berita\/semua"[^>]*>Portal Badung</);
  });

  it('link internal tetap tanpa target _blank', () => {
    const html = render(<Footer />);
    const internal = html.match(/<a[^>]*href="\/darmasaba\/[^"]*"[^>]*>/g) ?? [];
    expect(internal.length).toBeGreaterThan(0);
    for (const a of internal) expect(a).not.toContain('target=');
  });

  it('slogan tetap ada, maskot chatbot tidak dirender', () => {
    const html = render(<Footer />);
    expect(html).toContain('Desa Kuat, Warga Sejahtera!');
    expect(html).not.toContain('chatbot-removebg-preview');
    expect(FOOTER_SRC).not.toContain('chatbot-removebg-preview');
  });
});

describe('Footer — Pengaduan Masyarakat', () => {
  it('menjadi tombol pemicu (button), bukan lagi link ke /darmasaba/keamanan/laporan-publik', () => {
    const html = render(<Footer />);
    expect(html).not.toContain('/darmasaba/keamanan/laporan-publik');
    expect(html).not.toMatch(/<a[^>]*>Pengaduan Masyarakat<\/a>/);
    // Grid desktop; panel accordion ponsel yang masih tertutup tidak ikut di-render saat SSR.
    expect(html.match(/<button[^>]*type="button"[^>]*>Pengaduan Masyarakat<\/button>/g)).toHaveLength(1);
    // Footer memakai renderLink yang sama untuk grid desktop & accordion ponsel.
    expect(FOOTER_SRC.match(/group\.links\.map\(\(item\) => renderLink\(item, '(xs|sm)'\)\)/g)).toHaveLength(2);
  });

  it('modal belum dirender sebelum diklik (tidak membebani tiap halaman)', () => {
    expect(render(<Footer />)).not.toContain('Ajukan Pengaduan Masyarakat');
  });

  it('memakai komponen PengaduanMasyarakatModal yang sama dengan halaman layanan online desa', () => {
    expect(FOOTER_SRC).toContain("import('./pengaduan/PengaduanMasyarakatModal')");
    expect(FOOTER_SRC).toMatch(/<PengaduanMasyarakatModal opened=\{pengaduanOpened\} onClose=\{pengaduan\.close\} \/>/);
  });
});
