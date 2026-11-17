// @vitest-environment node
// Dashboard Kependudukan #umur: keadaan memuat/galat/kosong, panel urut umur, total & persen disembunyikan bila tumpang tindih.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { DatasetSlice } from '@/app/(public)/(pages)/kependudukan/_com/data/kependudukan-data.types';
import { UmurSection } from '@/app/(public)/(pages)/kependudukan/_com/umur/UmurSection';
import { UMUR_TEXT as T } from '@/app/(public)/(pages)/kependudukan/_com/umur/umur.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const slice = (over: Partial<DatasetSlice>): DatasetSlice => ({
  status: 'ready',
  tahun: 2026,
  tahunTersedia: [2026],
  rows: [],
  allRows: [],
  retry: vi.fn(),
  ...over,
});

const row = (id: string, rentangUmur: string, jumlah: number) => ({
  id,
  rentangUmur,
  jumlah,
  tahun: 2026,
  updatedAt: '2026-11-03T06:45:42.000Z',
});
// test-only: seed / stg 2026-11-17.
const BPS = [row('c', '65+', 545), row('a', '25-54', 1680), row('b', '0-14', 820), row('d', '15-24', 650), row('e', '55-64', 520)];

describe('Keadaan', () => {
  it('memuat → kerangka aria-busy di dalam section #umur, judul h2 tetap ada untuk aria-labelledby', () => {
    const html = render(<UmurSection data={slice({ status: 'loading', tahun: null })} />);
    expect(html).toContain('id="umur"');
    expect(html).toContain('aria-labelledby="umur-panel-title"');
    expect(html).toMatch(/<h2 id="umur-panel-title"[^>]*>Kelompok Umur<\/h2>/);
    expect(html).toContain('aria-busy="true"');
  });

  it('galat ≠ kosong: role alert + tombol coba lagi + judul h2', () => {
    const html = render(<UmurSection data={slice({ status: 'error', tahun: null })} />);
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain(T.failed);
    expect(text(html)).toContain('Coba lagi');
    expect(html).toMatch(/<h2 id="umur-panel-title"[^>]*>Kelompok Umur<\/h2>/);
    expect(text(html)).not.toContain(T.emptyBody);
  });

  it('kosong → satu ubin "belum diisi", tanpa daftar dan tanpa angka 0', () => {
    const html = render(<UmurSection data={slice({ tahun: null, tahunTersedia: [] })} />);
    expect(text(html)).toContain(T.emptyBody);
    expect(html).toMatch(/<h2 id="umur-panel-title"[^>]*>Kelompok Umur<\/h2>/);
    expect(html).not.toContain('<ol');
    expect(text(html)).not.toMatch(/\b0 jiwa/);
  });
});

describe('Panel skema BPS', () => {
  const out = text(render(<UmurSection data={slice({ rows: BPS })} />));

  it('tahun data + tanggal pembaruan tertulis di kepala', () => {
    expect(out).toContain('Data 2026 · Diperbarui 3 November 2026');
  });

  it('urut umur, bukan urutan API', () => {
    const order = ['0–14 tahun', '15–24 tahun', '25–54 tahun', '55–64 tahun', '65 tahun ke atas'].map((l) => out.indexOf(l));
    expect(order.every((v, i) => v >= 0 && (i === 0 || v > order[i - 1]))).toBe(true);
  });

  it('total + persen asli + catatan sumber', () => {
    expect(out).toContain(`${T.totalLabel} 4.215 ${T.unit}`);
    expect(out).toContain('39,9%');
    expect(out).toContain(T.sourceNote);
  });

  it('ubin turunan: produktif 2.850 jiwa (67,6%) dan rasio 47,9', () => {
    expect(out).toContain(`${T.produktifLabel} 2.850 ${T.unit}`);
    expect(out).toContain('67,6%');
    expect(out).toContain(`${T.rasioLabel} 47,9`);
    expect(out).toContain(T.rasioHint(48));
  });
});

describe('Panel stg 2026 (0–14 + 6–12 tumpang tindih)', () => {
  const out = text(render(<UmurSection data={slice({ rows: [...BPS, row('f', '6-12', 90)] })} />));

  it('semua baris tetap tampil apa adanya', () => {
    expect(out).toContain('6–12 tahun 90 jiwa');
    expect(out).toContain('0–14 tahun 820 jiwa');
  });

  it('total, persen, catatan sumber, dan ubin turunan disembunyikan; catatan tumpang tindih tampil', () => {
    expect(out).not.toContain(T.totalLabel);
    expect(out).not.toContain('%');
    expect(out).not.toContain(T.sourceNote);
    expect(out).not.toContain(T.rasioLabel);
    expect(out).toContain(T.overlapNote('0–14 tahun', '6–12 tahun'));
  });
});

describe('Skema form admin (13–17 melintasi 15)', () => {
  const rows = ['0-5', '6-12', '13-17', '18-25', '26-35', '36-45', '46-55', '56-64', '65+'].map((r, i) => row(String(i), r, 10));
  const out = text(render(<UmurSection data={slice({ rows })} />));

  it('total & persen tampil (saling lepas), tapi tanpa ubin turunan', () => {
    expect(out).toContain(`${T.totalLabel} 90 ${T.unit}`);
    expect(out).not.toContain(T.produktifLabel);
  });
});
