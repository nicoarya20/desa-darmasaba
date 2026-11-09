// @vitest-environment node
// Footer publik: blok "Kontak Bupati" (field kosong tidak dirender) & item
// "Pengaduan Masyarakat" yang menjadi pemicu modal form pengaduan, bukan link halaman.
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import Footer from '@/app/darmasaba/_com/Footer';
import { FooterKontakBupati } from '@/app/darmasaba/_com/FooterKontakBupati';
import { KONTAK_BUPATI, kontakBupatiLinks } from '@/con/kontak-bupati';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const FOOTER_SRC = readFileSync(path.resolve(__dirname, '../../src/app/darmasaba/_com/Footer.tsx'), 'utf8');

describe('Footer — Kontak Bupati', () => {
  it('merender judul (grid desktop + accordion ponsel), jabatan & link website tab baru dengan rel aman', () => {
    const html = render(<Footer />);
    // Teks judul (bukan atribut id/aria accordion).
    expect(html.match(/>Kontak Bupati</g)).toHaveLength(2);
    expect(html).toContain('>Bupati Badung<');
    const websiteLinks = html.match(/<a[^>]*href="https:\/\/badungkab\.go\.id"[^>]*>/g) ?? [];
    // Grid desktop; panel accordion ponsel yang tertutup tidak di-render saat SSR.
    expect(websiteLinks).toHaveLength(1);
    expect(websiteLinks[0]).toContain('target="_blank"');
    expect(websiteLinks[0]).toContain('rel="noopener noreferrer"');
    // Accordion ponsel memakai komponen isi yang sama.
    expect(FOOTER_SRC).toContain('<FooterKontakBupati fz="sm" />');
  });

  it('telepon & email kosong → tidak ada link tel:/mailto:', () => {
    expect(KONTAK_BUPATI.telepon).toBe('');
    expect(KONTAK_BUPATI.email).toBe('');
    const html = render(<Footer />);
    expect(html).not.toContain('href="tel:');
    expect(html).not.toContain('href="mailto:');
  });

  it('telepon & email terisi → link tel:/mailto: dirender tanpa target _blank', () => {
    const html = render(
      <FooterKontakBupati
        fz="xs"
        kontak={{ ...KONTAK_BUPATI, telepon: '(0361) 123-456', email: 'bupati@badungkab.go.id' }}
      />,
    );
    expect(html).toMatch(/<a(?![^>]*target)[^>]*href="tel:0361123456"[^>]*>\(0361\) 123-456<\/a>/);
    expect(html).toMatch(/<a(?![^>]*target)[^>]*href="mailto:bupati@badungkab.go.id"[^>]*>bupati@badungkab.go.id<\/a>/);
  });

  it('kontakBupatiLinks melewati field kosong / berisi spasi saja', () => {
    expect(kontakBupatiLinks({ ...KONTAK_BUPATI, telepon: '  ', email: ' ', website: '' })).toEqual([]);
    expect(kontakBupatiLinks(KONTAK_BUPATI).map((l) => l.key)).toEqual(['website']);
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
