// @vitest-environment node
// Section "Layanan Masyarakat" beranda: 4 kartu dari daftar yang sama dengan footer
// "Layanan Desa", kartu Pengaduan = tombol pembuka modal (bukan link), tanpa judul sendiri,
// dan posisinya tepat setelah galeri Layanan & Potensi (satu pita dengan galeri).
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import LayananMasyarakat from '@/app/(public)/_com/main-page/layanan-masyarakat';
import { LAYANAN_MASYARAKAT_TEXT } from '@/app/(public)/_com/main-page/layanan-masyarakat/layanan-masyarakat.text';
import Footer from '@/app/(public)/_com/Footer';
import { LAYANAN_DESA } from '@/con/layanan-desa';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const SRC = (rel: string) => readFileSync(path.resolve(__dirname, '../../src', rel), 'utf8');

const linkItems = LAYANAN_DESA.filter((item): item is Extract<typeof item, { link: string }> => 'link' in item);

describe('LAYANAN_DESA', () => {
  it('berisi tepat 4 layanan dengan tujuan halaman yang ada di footer sebelumnya', () => {
    expect(LAYANAN_DESA.map((item) => item.title)).toEqual([
      'Administrasi Kependudukan',
      'Layanan Sosial',
      'Pengaduan Masyarakat',
      'Informasi Publik',
    ]);
    expect(linkItems.map((item) => item.link)).toEqual([
      '/pemerintahan/layanan',
      '/ekonomi/program-kemiskinan',
      '/ppid/daftar-informasi-publik',
    ]);
    expect(LAYANAN_DESA.filter((item) => 'opensPengaduanModal' in item).map((item) => item.id)).toEqual(['pengaduan']);
  });

  it('setiap layanan punya deskripsi dan label aksi sendiri (bukan "Selengkapnya" seragam)', () => {
    for (const item of LAYANAN_DESA) {
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.cta.length).toBeGreaterThan(0);
    }
    expect(new Set(LAYANAN_DESA.map((item) => item.cta)).size).toBe(LAYANAN_DESA.length);
    expect(LAYANAN_DESA.map((item) => item.cta)).not.toContain('Selengkapnya');
  });
});

describe('LayananMasyarakat', () => {
  const html = render(<LayananMasyarakat />);

  it('tanpa judul h2/pengantar: section diberi aria-label, 4 kartu tetap berjudul h3', () => {
    expect(LAYANAN_MASYARAKAT_TEXT).toEqual({ ariaLabel: 'Layanan Masyarakat' });
    expect(html).toMatch(/<section[^>]*aria-label="Layanan Masyarakat"[^>]*>/);
    expect(html).not.toContain('aria-labelledby');
    expect(html).not.toContain('<h2');
    expect(html).not.toContain('<header');
    expect(html.match(/<h3/g)).toHaveLength(4);
    for (const item of LAYANAN_DESA) {
      expect(html).toContain(`>${item.title}</h3>`);
      expect(html).toContain(item.description);
      expect(html).toContain(item.cta);
    }
  });

  it('kartu tautan merender satu <a> ke tujuan masing-masing, tanpa tab baru', () => {
    expect(html.match(/<a\b/g)).toHaveLength(linkItems.length);
    for (const item of linkItems) {
      const anchors = html.match(new RegExp(`<a[^>]*href="${item.link}"[^>]*>`, 'g')) ?? [];
      expect(anchors).toHaveLength(1);
      expect(anchors[0]).not.toContain('target="_blank"');
    }
  });

  it('kartu Pengaduan adalah tombol pembuka dialog; modal belum dipasang sebelum diklik', () => {
    const buttons = html.match(/<button[^>]*>[\s\S]*?<\/button>/g) ?? [];
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toContain('type="button"');
    expect(buttons[0]).toContain('aria-haspopup="dialog"');
    expect(buttons[0]).toContain('>Pengaduan Masyarakat</h3>');
    expect(html).not.toContain('role="dialog"');
  });

  it('memakai PengaduanMasyarakatModal yang sama dengan footer, dimuat dinamis', () => {
    const src = SRC('app/(public)/_com/main-page/layanan-masyarakat/index.tsx');
    expect(src).toContain('import("../../pengaduan/PengaduanMasyarakatModal")');
    expect(src).toContain('{ ssr: false }');
  });
});

describe('Integrasi beranda & footer', () => {
  it('section dipasang tepat setelah galeri <LayananPotensi /> dan hanya sekali di beranda', () => {
    const page = SRC('app/(public)/page.tsx');
    expect(page).toMatch(/<LayananPotensi \/>\s*<LayananMasyarakat \/>/);
    expect(page.match(/<LayananMasyarakat \/>/g)).toHaveLength(1);
    expect(page).not.toMatch(/<Kepuasan \/>\s*<LayananMasyarakat \/>/);
  });

  it('latar section transparan (satu pita dengan galeri) dan sisa gaya judul dibersihkan', () => {
    const css = SRC('app/(public)/_com/main-page/layanan-masyarakat/layanan-masyarakat.module.css');
    const section = css.match(/\.section \{[^}]*\}/)?.[0] ?? '';
    expect(section).not.toMatch(/background/);
    // Titik slide → kartu = setengah --block-gap (lebih rapat dari kartu → batas pita = --section-pad-y).
    expect(section).toContain('--gallery-dots-tail: 15px;');
    expect(section).toContain('margin-top: calc(var(--block-gap) / 2 - var(--section-pad-y) - var(--gallery-dots-tail));');
    expect(section).toContain('padding: 0 16px var(--section-pad-y);');
    expect(css).not.toMatch(/\.(header|title|lead)\s*\{/);
  });

  it('footer "Layanan Desa" tetap ada dan memakai daftar yang sama', () => {
    expect(SRC('app/(public)/_com/Footer.tsx')).toContain('LAYANAN_DESA.map(');
    const footer = render(<Footer />);
    for (const item of linkItems) {
      expect(footer).toMatch(new RegExp(`<a[^>]*href="${item.link}"[^>]*>${item.title}</a>`));
    }
    expect(footer.match(/<button[^>]*type="button"[^>]*>Pengaduan Masyarakat<\/button>/g)).toHaveLength(1);
  });
});
