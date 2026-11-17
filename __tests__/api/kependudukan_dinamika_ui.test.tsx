// @vitest-environment node
// Section Dinamika Dashboard Kependudukan: neraca tahun terbaru, riwayat di <details>, keadaan muat/galat/kosong.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { DatasetSlice } from '@/app/(public)/(pages)/kependudukan/_com/data/kependudukan-data.types';
import { DinamikaSection } from '@/app/(public)/(pages)/kependudukan/_com/dinamika/DinamikaSection';
import { DINAMIKA_TEXT as T } from '@/app/(public)/(pages)/kependudukan/_com/dinamika/dinamika.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only: data stg 2026-11-17 (seed), urut tahun menurun seperti API.
const STG = [
  { id: 'cmk-dinamika-001', tahun: 2026, kelahiran: 45, kematian: 18, masuk: 22, keluar: 15 },
  { id: 'cmk-dinamika-002', tahun: 2025, kelahiran: 52, kematian: 21, masuk: 18, keluar: 12 },
  { id: 'cmk-dinamika-003', tahun: 2024, kelahiran: 48, kematian: 19, masuk: 25, keluar: 20 },
];
const NOV_2026 = new Date(2026, 10, 17);
const JAN_2027 = new Date(2027, 0, 5);

const slice = (patch: Partial<DatasetSlice>): DatasetSlice => ({
  status: 'ready',
  tahun: 2026,
  tahunTersedia: [2026, 2025, 2024],
  rows: [STG[0]],
  allRows: STG,
  retry: () => {},
  ...patch,
});
const section = (data: DatasetSlice, now = NOV_2026) => render(<DinamikaSection data={data} now={now} />);

describe('DinamikaSection siap', () => {
  it('anchor #dinamika berlabel judul h2', () => {
    const html = section(slice({}));
    expect(html).toContain('id="dinamika"');
    expect(html).toContain(`aria-labelledby="${T.titleId}"`);
    expect(html).toMatch(new RegExp(`<h2[^>]*id="${T.titleId}"[^>]*>${T.title}</h2>`));
  });

  it('neraca 2026: bertambah 67 (45 + 22), berkurang 33 (18 + 15), bersih +34', () => {
    const out = text(section(slice({})));
    expect(out).toContain('Perubahan bersih +34 orang');
    expect(out).toContain('Bertambah 67 orang');
    expect(out).toContain('Kelahiran 45');
    expect(out).toContain('Pindah masuk 22');
    expect(out).toContain('Berkurang 33 orang');
    expect(out).toContain('Kematian 18');
    expect(out).toContain('Pindah keluar 15');
    expect(out).toContain('Pertumbuhan alami +27');
    expect(out).toContain('Migrasi bersih +7');
  });

  it('tahun berjalan diberi catatan; tahun yang sudah lewat tidak', () => {
    expect(text(section(slice({}), NOV_2026))).toContain(`Data 2026 · ${T.berjalan}`);
    const lewat = text(section(slice({}), JAN_2027));
    expect(lewat).toContain('Data 2026');
    expect(lewat).not.toContain(T.berjalan);
  });

  it('riwayat semua tahun di <details> tertutup, terbaru dulu, dengan bersih per tahun', () => {
    const html = section(slice({}));
    expect(html).toMatch(/<details[^>]*>/);
    expect(html).not.toMatch(/<details[^>]*open/);
    const out = text(html);
    expect(out).toContain(T.riwayat(3));
    expect(out.indexOf('2026 45 18 22 15 +34')).toBeGreaterThan(-1);
    expect(out.indexOf('2025 52 21 18 12 +37')).toBeGreaterThan(out.indexOf('2026 45 18 22 15 +34'));
    expect(out).toContain('2024 48 19 25 20 +34');
    expect(html).toContain('data-label="Pindah masuk"');
  });

  it('hanya satu tahun → tanpa riwayat', () => {
    const html = section(slice({ allRows: [STG[0]], tahunTersedia: [2026] }));
    expect(html).not.toContain('<details');
  });

  it('bersih negatif ditulis dengan tanda minus', () => {
    const turun = { id: 't', tahun: 2023, kelahiran: 5, kematian: 20, masuk: 3, keluar: 10 };
    const out = text(section(slice({ tahun: 2023, rows: [turun], allRows: [turun] }), JAN_2027));
    expect(out).toContain('Perubahan bersih -22 orang');
  });

  it('tanpa kotak warna lama (kontras putih di hijau 1,65:1)', () => {
    expect(section(slice({}))).not.toContain('#6EDF9C');
  });
});

const H2 = new RegExp(`<h2[^>]*id="${T.titleId}"[^>]*>${T.title}</h2>`);

describe('DinamikaSection keadaan lain', () => {
  it.each([
    ['memuat', { status: 'loading' as const }],
    ['galat', { status: 'error' as const }],
    ['kosong', { rows: [], allRows: [] }],
  ])('%s → section #dinamika tetap berjudul h2 (target aria-labelledby)', (_, patch) => {
    const html = section(slice({ ...patch, tahun: null }));
    expect(html).toContain('id="dinamika"');
    expect(html).toContain(`aria-labelledby="${T.titleId}"`);
    expect(html).toMatch(H2);
  });

  it('memuat → kerangka aria-busy, tanpa angka', () => {
    const html = section(slice({ status: 'loading', rows: [], allRows: [], tahun: null }));
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(`aria-label="${T.loading}"`);
    expect(html).toContain('id="dinamika"');
  });

  it('galat → role=alert + tombol Coba lagi memanggil retry (beda dari kosong)', () => {
    const retry = vi.fn();
    const html = section(slice({ status: 'error', rows: [], allRows: [], tahun: null, retry }));
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain(T.error);
    expect(text(html)).toContain('Coba lagi');
    expect(text(html)).not.toContain(T.empty);
  });

  it('kosong → ubin "akan tampil di sini", tanpa angka 0', () => {
    const out = text(section(slice({ rows: [], allRows: [], tahun: null, tahunTersedia: [] })));
    expect(out).toContain(T.empty);
    expect(out).not.toContain('Perubahan bersih');
    expect(out).not.toMatch(/\b0 orang/);
  });

  it('baris rusak saja → diperlakukan kosong', () => {
    const out = text(section(slice({ rows: [{ id: 'x', tahun: 2026 }], allRows: [{ id: 'x', tahun: 2026 }] })));
    expect(out).toContain(T.empty);
  });
});
