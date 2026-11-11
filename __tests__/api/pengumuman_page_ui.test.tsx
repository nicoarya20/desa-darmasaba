// @vitest-environment node
// Halaman Pengumuman publik: baris daftar (thumbnail/ikon, kategori, tanggal) dan lampiran PDF di detail.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
import { PengumumanDokumenRows } from '@/app/darmasaba/(pages)/pemerintahan/pengumuman/_com/detail/PengumumanDokumenRows';
import { PengumumanRows } from '@/app/darmasaba/(pages)/pemerintahan/pengumuman/_com/PengumumanRows';
import s from '@/app/darmasaba/(pages)/pemerintahan/pengumuman/_com/pengumuman-list.module.css';
import type { KabarItem } from '@/app/darmasaba/_com/main-page/kabar-desa/kabar.logic';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: entri pengumuman siap tampil.
const item = (id: string, imageUrl?: string): KabarItem => ({
  id,
  title: `Pengumuman ${id}`,
  summary: '',
  kategori: 'Lelang & Pengadaan',
  imageUrl,
  createdAt: Date.UTC(2026, 8, 13, 16),
  href: `/darmasaba/pemerintahan/pengumuman/Lelang%20%26%20Pengadaan/${id}`,
});

const rows = (props: Partial<React.ComponentProps<typeof PengumumanRows>>) =>
  render(
    <PengumumanRows items={[]} loading={false} placeholderRows={3} showKategori loadingLabel="Memuat" {...props} />,
  );

describe('PengumumanRows', () => {
  it('satu tautan per pengumuman; thumbnail bila ada gambar, ikon dokumen bila tidak', () => {
    const html = rows({ items: [item('a', '/api/img/a.webp'), item('b')] });
    expect(count(html, `class="${s.row}"`)).toBe(2);
    expect(html).toContain('href="/darmasaba/pemerintahan/pengumuman/Lelang%20%26%20Pengadaan/a"');
    expect(html).toContain('src="/api/img/a.webp"');
    expect(count(html, s.thumbFallback)).toBe(1);
    // tanggal terbit WITA (13 Sep 16:00 UTC = 14 Sep WITA)
    expect(html).toContain('14 Sep 2026');
  });

  it('nama kategori disembunyikan saat daftar sudah disaring satu kategori', () => {
    expect(rows({ items: [item('a')] })).toContain('Lelang &amp; Pengadaan');
    expect(rows({ items: [item('a')], showKategori: false })).not.toContain('Lelang &amp; Pengadaan');
  });

  it('memuat → baris kerangka sejumlah placeholderRows, tanpa tautan', () => {
    const html = rows({ loading: true, placeholderRows: 4 });
    expect(count(html, `class="${s.rowPlaceholder}"`)).toBe(4);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('<a ');
  });
});

// test-only: berkas lampiran
const pdf = (id: string, size: number | null = 793532) => ({
  id,
  link: `/api/fileStorage/findUnique/${id}`,
  realName: `${id}.pdf`,
  mimeType: 'application/pdf',
  size,
});

describe('PengumumanDokumenRows', () => {
  it('baris per PDF: nama, ukuran, pratinjau & unduh berlabel nama berkas', () => {
    const html = render(<PengumumanDokumenRows dokumen={[pdf('lelang'), pdf('kpm', null)]} label="Lampiran" />);
    expect(count(html, 'data-pengumuman-dokumen')).toBe(2);
    expect(html).toContain('aria-label="Pratinjau lelang.pdf"');
    expect(html).toContain('href="/api/fileStorage/findUnique/lelang"');
    expect(html).toContain('download="lelang.pdf"');
    expect(count(html, 'PDF · ')).toBe(1);
  });

  it('tanpa berkas bertautan → tidak dirender', () => {
    expect(render(<PengumumanDokumenRows dokumen={[{ ...pdf('x'), link: '' }]} label="Lampiran" />)).not.toContain('<ul');
  });
});
