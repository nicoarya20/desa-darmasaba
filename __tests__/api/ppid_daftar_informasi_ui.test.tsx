// @vitest-environment node
// Halaman publik Daftar Informasi Publik: helper murni + markup tabel (teks utuh, tautan detail).
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup.
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

import { DaftarTable, DaftarTableSkeleton } from '@/app/darmasaba/(pages)/ppid/daftar-informasi-publik/_com/DaftarTable';
import {
  daftarDetailHref,
  formatTanggal,
  rowNumber,
  type InformasiItem,
} from '@/app/darmasaba/(pages)/ppid/daftar-informasi-publik/_com/daftar.logic';
import { DAFTAR_TEXT } from '@/app/darmasaba/(pages)/ppid/daftar-informasi-publik/_com/daftar.text';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: dua informasi fiktif; yang pertama berjudul & berdeskripsi panjang.
const LONG_JENIS = 'Kemudahan Akses Internet dan Informasi Desa untuk Seluruh Banjar di Wilayah Desa Darmasaba';
const LONG_DESKRIPSI = `Penyediaan jaringan komunikasi ${'dan informasi desa '.repeat(20)}selesai.`;
const ITEMS: InformasiItem[] = [
  { id: 'a1', jenisInformasi: LONG_JENIS, deskripsi: `<p>${LONG_DESKRIPSI}</p>`, tanggal: '2025-02-21T00:00:00.000Z' },
  { id: 'b2', jenisInformasi: 'Penyelenggaraan Informasi Publik', deskripsi: '<p><strong>Tebal</strong> &amp; biasa</p>', tanggal: null },
];

describe('daftar.logic', () => {
  it('rowNumber melanjutkan nomor lintas halaman', () => {
    expect(rowNumber(1, 0)).toBe(1);
    expect(rowNumber(2, 0)).toBe(6);
    expect(rowNumber(3, 4)).toBe(15);
  });

  it('formatTanggal: tanggal Indonesia, kosong/tidak valid → fallback', () => {
    expect(formatTanggal('2025-02-21T00:00:00.000Z', '-')).toBe('21 Februari 2025');
    expect(formatTanggal(null, '-')).toBe('-');
    expect(formatTanggal('bukan tanggal', '-')).toBe('-');
  });

  it('daftarDetailHref menunjuk rute detail publik', () => {
    expect(daftarDetailHref('a1')).toBe('/darmasaba/ppid/daftar-informasi-publik/a1');
  });
});

describe('DaftarTable', () => {
  it('menampilkan jenis informasi dan deskripsi utuh sebagai teks polos (tanpa dipotong)', () => {
    const html = render(<DaftarTable items={ITEMS} page={1} />);
    expect(html).toContain(LONG_JENIS);
    expect(html).toContain(LONG_DESKRIPSI.replace(/\s+/g, ' '));
    expect(html).toContain('Tebal &amp; biasa');
    expect(html).not.toContain('<strong>');
    expect(html).not.toContain('line-clamp');
  });

  it('satu baris per item dengan kepala kolom, nomor urut halaman, dan tanggal', () => {
    const html = render(<DaftarTable items={ITEMS} page={2} />);
    expect(html.match(/<tr/g)).toHaveLength(1 + ITEMS.length);
    for (const label of Object.values(DAFTAR_TEXT.columns)) expect(html).toContain(`>${label}</th>`);
    expect(html).toMatch(/<td[^>]*>6<\/td>/);
    expect(html).toMatch(/<td[^>]*>7<\/td>/);
    expect(html).toContain('21 Februari 2025');
    expect(html).toMatch(new RegExp(`<td[^>]*>${DAFTAR_TEXT.emptyValue}</td>`));
  });

  it('tautan Detail tiap baris menuju halaman detail dan punya nama aksesibel', () => {
    const html = render(<DaftarTable items={ITEMS} page={1} />);
    expect(html.match(/<a /g)).toHaveLength(ITEMS.length);
    expect(html).toContain('href="/darmasaba/ppid/daftar-informasi-publik/a1"');
    expect(html).toContain(`aria-label="${DAFTAR_TEXT.detailLabel('Penyelenggaraan Informasi Publik')}"`);
  });

  it('menandai sedang memuat tanpa membuang baris lama', () => {
    const html = render(<DaftarTable items={ITEMS} page={1} busy />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(LONG_JENIS);
  });
});

describe('DaftarTableSkeleton', () => {
  it('berperan status dengan label memuat', () => {
    const html = render(<DaftarTableSkeleton />);
    expect(html).toContain('role="status"');
    expect(html).toContain(`aria-label="${DAFTAR_TEXT.loading}"`);
  });
});
