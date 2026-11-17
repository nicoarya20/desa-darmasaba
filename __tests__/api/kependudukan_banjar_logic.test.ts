// @vitest-environment node
// Dashboard Kependudukan, section Per Banjar: parser baris DataBanjar, total desa (dipakai hero), item batang.
import { describe, expect, it } from 'vitest';
import {
  banjarDetail,
  banjarTotals,
  formatJiwaPerKk,
  parseBanjarRows,
  toBanjarBars,
  type BanjarRow,
} from '@/app/(public)/(pages)/kependudukan/_com/banjar/banjar.logic';

const LABEL = { kk: 'KK', miskin: 'keluarga miskin' }; // test-only

// test-only: baris mentah stg 2026-11-17 (12 banjar, miskin semua 0, total 10.254 jiwa / 2.322 KK).
const STG: [string, number, number][] = [
  ['Balerpasar', 1106, 230], ['Bersih', 1077, 237], ['Bucu', 540, 105], ['Cabe', 947, 223],
  ['Darmasaba', 542, 130], ['Gulingan', 972, 205], ['Menesa', 403, 103], ['Penenjoan', 862, 231],
  ['Taman', 1082, 225], ['Telanga', 878, 195], ['Tengah', 844, 188], ['Umahanyar', 1001, 250],
];
const stgRaw = STG.map(([nama, penduduk, kk], i) => ({
  id: `b${i}`, nama, penduduk, kk, miskin: 0, tahun: 2026, isActive: true, updatedAt: '2026-11-14T03:00:00.000Z',
}));

const row = (id: string, penduduk: number | null, kk: number | null, miskin: number | null = 0): BanjarRow => ({
  id, nama: id, penduduk, kk, miskin, tahun: 2026, updatedAt: null,
});

describe('parseBanjarRows', () => {
  it('membaca 12 baris stg apa adanya', () => {
    const rows = parseBanjarRows(stgRaw);
    expect(rows).toHaveLength(12);
    expect(rows[0]).toEqual({ id: 'b0', nama: 'Balerpasar', penduduk: 1106, kk: 230, miskin: 0, tahun: 2026, updatedAt: '2026-11-14T03:00:00.000Z' });
  });

  it('membuang baris tanpa id/nama dan nilai bukan objek', () => {
    const rows = parseBanjarRows([null, 'x', [], { id: 'a', nama: '  ' }, { nama: 'Tanpa id', penduduk: 5 }, { id: 'ok', nama: ' Bucu ', penduduk: 5 }]);
    expect(rows.map((r) => r.nama)).toEqual(['Bucu']);
  });

  it('angka tak terbaca → null (belum diisi), bukan 0; titik ribuan string diterima', () => {
    const [r] = parseBanjarRows([{ id: 'a', nama: 'A', penduduk: '1.200', kk: -3, miskin: 1.5, tahun: 'x', updatedAt: '' }]);
    expect(r).toMatchObject({ penduduk: 1200, kk: null, miskin: null, tahun: null, updatedAt: null });
  });

  it('nama ganda tidak digabung', () => {
    expect(parseBanjarRows([{ id: '1', nama: 'Cabe', penduduk: 1 }, { id: '2', nama: 'Cabe', penduduk: 2 }])).toHaveLength(2);
  });
});

describe('banjarTotals', () => {
  it('stg: 10.254 jiwa, 2.322 KK, jiwa/KK 4,4, miskin semua 0 → belum diisi (null)', () => {
    const t = banjarTotals(parseBanjarRows(stgRaw));
    expect(t.penduduk).toBe(10254);
    expect(t.kk).toBe(2322);
    expect(t.miskinTerisi).toBe(false);
    expect(t.miskin).toBeNull();
    expect(t.jiwaPerKk).toBeCloseTo(10254 / 2322, 6);
    expect(formatJiwaPerKk(t.jiwaPerKk!)).toBe('4,4');
  });

  it('miskin terisi bila minimal satu banjar > 0; total menjumlah semua yang terisi', () => {
    const t = banjarTotals([row('a', 100, 20, 3), row('b', 50, 10, 0), row('c', 40, 8, null)]);
    expect(t).toMatchObject({ miskinTerisi: true, miskin: 3, penduduk: 190, kk: 38 });
  });

  it('jiwa/KK hanya dari banjar yang penduduk & KK-nya terisi (KK > 0)', () => {
    const t = banjarTotals([row('a', 100, 25), row('b', 999, null), row('c', null, 50), row('d', 30, 0)]);
    expect(t.jiwaPerKk).toBe(4);
    expect(t.penduduk).toBe(1129);
    expect(t.kk).toBe(75);
  });

  it('tanpa baris / tanpa angka → semua null, bukan 0', () => {
    expect(banjarTotals([])).toEqual({ penduduk: null, kk: null, miskin: null, miskinTerisi: false, jiwaPerKk: null });
    expect(banjarTotals([row('a', null, null, null)])).toMatchObject({ penduduk: null, kk: null, jiwaPerKk: null });
  });
});

describe('item batang', () => {
  it('urut penduduk terbanyak, belum diisi di akhir, nilai sama tetap urutan asal', () => {
    const bars = toBanjarBars([row('a', 10, 1), row('b', null, 2), row('c', 30, 3), row('d', 10, 4)], false, LABEL);
    expect(bars.map((b) => b.id)).toEqual(['c', 'a', 'd', 'b']);
    expect(bars[0]).toMatchObject({ label: 'c', value: 30, kk: 3, detail: '3 KK' });
  });

  it('stg: Balerpasar teratas, Menesa terbawah', () => {
    const bars = toBanjarBars(parseBanjarRows(stgRaw), false, LABEL);
    expect(bars[0].label).toBe('Balerpasar');
    expect(bars.at(-1)!.label).toBe('Menesa');
  });

  it('detail: KK ribuan bertitik; keluarga miskin hanya bila kolom terisi; tanpa angka → undefined', () => {
    expect(banjarDetail(row('a', 1, 1250, 12), false, LABEL)).toBe('1.250 KK');
    expect(banjarDetail(row('a', 1, 230, 12), true, LABEL)).toBe('230 KK · 12 keluarga miskin');
    expect(banjarDetail(row('a', 1, 230, 0), true, LABEL)).toBe('230 KK · 0 keluarga miskin');
    expect(banjarDetail(row('a', 1, null, null), true, LABEL)).toBeUndefined();
  });
});
