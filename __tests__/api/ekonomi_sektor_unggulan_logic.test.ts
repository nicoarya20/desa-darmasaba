// @vitest-environment node
// Sektor Unggulan Desa publik: normalisasi item API, peringkat nilai, batang hanya bila satuan seragam, angka polos tanpa "Ton".
import { describe, expect, it } from 'vitest';
import {
  formatNilai,
  rankSektor,
  sektorFigure,
  summarizeSektor,
  toSektor,
  type Sektor,
  type SektorApiItem,
} from '@/app/(public)/(pages)/ekonomi/sektor-unggulan-desa/_com/sektor-unggulan.logic';

const identity = (html: string) => html; // test-only: DOMPurify butuh DOM
// test-only: bentuk entri stg 2026-11-16 (7 sektor, tanpa satuan/periode)
const api = (over: Partial<SektorApiItem> & { id: string; name: string }): SektorApiItem => ({
  description: `<p>Deskripsi ${over.name}</p>`,
  value: 10,
  satuan: null,
  periode: null,
  updatedAt: '2026-04-14T02:00:00.000Z',
  ...over,
});
const sektor = (over: Partial<SektorApiItem> & { id: string; name: string }): Sektor => toSektor(api(over), identity);

describe('toSektor', () => {
  it('memangkas teks, menyaring deskripsi, dan menjadikan satuan/periode kosong undefined', () => {
    const s = toSektor(api({ id: 'a', name: '  Pertanian ', description: '<p>Padi</p>', satuan: '  ', periode: ' 2025 ' }), (h) => `[${h}]`);
    expect(s).toMatchObject({ id: 'a', name: 'Pertanian', value: 10, periode: '2025', html: '[<p>Padi</p>]' });
    expect(s.satuan).toBeUndefined();
    expect(s.updatedAt).toBe('2026-04-14T02:00:00.000Z');
  });

  it('nilai null/NaN → null (belum diisi, bukan 0); deskripsi kosong <p></p> → tanpa html', () => {
    expect(sektor({ id: 'a', name: 'A', value: null }).value).toBeNull();
    expect(sektor({ id: 'a', name: 'A', value: Number.NaN }).value).toBeNull();
    expect(sektor({ id: 'a', name: 'A', description: '<p></p>' }).html).toBeUndefined();
    expect(sektor({ id: 'a', name: 'A', updatedAt: 'bukan tanggal' }).updatedAt).toBeNull();
  });
});

describe('rankSektor', () => {
  it('nilai tertinggi dulu, nilai sama → nama A–Z, belum diisi di akhir', () => {
    const ranked = rankSektor([
      { name: 'Kuliner', value: 15 },
      { name: 'Kosong', value: null },
      { name: 'Pertanian', value: 90 },
      { name: 'BUMDes', value: 15 },
    ]);
    expect(ranked.map((r) => r.name)).toEqual(['Pertanian', 'BUMDes', 'Kuliner', 'Kosong']);
  });
});

describe('summarizeSektor', () => {
  const widths = (sum: ReturnType<typeof summarizeSektor>) => sum.stat.rows.map((r) => [r.label, Math.round(r.width)]);

  it('data stg (tanpa satuan): peringkat, batang relatif ke sektor terbesar, angka polos tanpa "Ton"', () => {
    const summary = summarizeSektor([
      sektor({ id: '1', name: 'Kerajinan Genteng', value: 25 }),
      sektor({ id: '2', name: 'Pertanian', value: 90 }),
      sektor({ id: '3', name: 'Kawasan Kuliner', value: 15 }),
    ]);
    expect(summary.comparable).toBe(true);
    expect(summary.unit).toBeUndefined();
    expect(widths(summary)).toEqual([
      ['Pertanian', 100],
      ['Kerajinan Genteng', 28],
      ['Kawasan Kuliner', 17],
    ]);
    expect(summary.stat.rows.map((r) => r.figure)).toEqual(['90', '25', '15']);
    expect(summary.stat.rows[0].html).toBe('<p>Deskripsi Pertanian</p>');
  });

  it('satuan & periode seragam (abaikan huruf besar) → di kepala, tidak diulang per baris', () => {
    const summary = summarizeSektor([
      sektor({ id: '1', name: 'A', value: 5, satuan: 'ton', periode: '2025' }),
      sektor({ id: '2', name: 'B', value: 1250, satuan: 'Ton', periode: '2025' }),
    ]);
    expect(summary).toMatchObject({ comparable: true, periode: '2025' });
    expect(summary.unit?.toLowerCase()).toBe('ton');
    expect(summary.stat.rows.map((r) => r.figure)).toEqual(['1.250', '5']);
  });

  it('satuan campur → tanpa batang, satuan ditulis per baris', () => {
    const summary = summarizeSektor([
      sektor({ id: '1', name: 'A', value: 5, satuan: 'ton' }),
      sektor({ id: '2', name: 'B', value: 30, satuan: 'ekor' }),
    ]);
    expect(summary.comparable).toBe(false);
    expect(summary.unit).toBeUndefined();
    expect(summary.stat.rows.map((r) => r.figure)).toEqual(['30 ekor', '5 ton']);
  });

  it('belum diisi: di akhir, tanpa figure, dihitung; sektor lain tetap dibandingkan', () => {
    const summary = summarizeSektor([
      sektor({ id: '1', name: 'A', value: null }),
      sektor({ id: '2', name: 'B', value: 40 }),
    ]);
    expect(summary.stat.belumDiisi).toBe(1);
    expect(summary.comparable).toBe(true);
    expect(summary.stat.rows.map((r) => [r.label, r.figure])).toEqual([
      ['B', '40'],
      ['A', undefined],
    ]);
  });

  it('semua 0 atau semua belum diisi → tanpa batang (tak ada pembanding)', () => {
    expect(summarizeSektor([sektor({ id: '1', name: 'A', value: 0 })]).comparable).toBe(false);
    expect(summarizeSektor([sektor({ id: '1', name: 'A', value: null })]).comparable).toBe(false);
  });

  it('latest = updatedAt terbaru di antara sektor', () => {
    const summary = summarizeSektor([
      sektor({ id: '1', name: 'A', updatedAt: '2026-04-14T00:00:00Z' }),
      sektor({ id: '2', name: 'B', updatedAt: '2026-11-03T00:00:00Z' }),
    ]);
    expect(summary.stat.latest?.toISOString()).toBe('2026-11-03T00:00:00.000Z');
  });
});

describe('formatNilai & sektorFigure', () => {
  it('angka Indonesia polos', () => {
    expect(formatNilai(1250)).toBe('1.250');
    expect(formatNilai(0.5)).toBe('0,5');
    expect(formatNilai(90)).toBe('90');
  });

  it('satuan/periode bersama tidak diulang per baris; belum diisi → null', () => {
    const row = { value: 30, satuan: 'ekor', periode: '2025' };
    expect(sektorFigure(row, {})).toBe('30 ekor · 2025');
    expect(sektorFigure(row, { unit: 'ekor', periode: '2025' })).toBe('30');
    expect(sektorFigure({ value: null }, {})).toBeNull();
  });
});
