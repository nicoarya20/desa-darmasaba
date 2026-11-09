// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  countByCategory,
  formatShare,
  hasValues,
  monthlyCounts,
  summarizeKepuasan,
  sumValues,
  toSelectOptions,
  type RespondenItem,
} from '@/app/darmasaba/_com/main-page/kepuasan/kepuasan.logic';
import { RATING } from '@/app/darmasaba/_com/main-page/kepuasan/kepuasan.meta';

// test-only: bentuk meniru respons responden.findMany. Tanggal di tengah bulan agar
// tidak bergeser bulan di zona waktu mana pun (logika memakai waktu lokal seperti kode lama).
const r = (over: Partial<RespondenItem> = {}): RespondenItem => ({
  tanggal: '2026-03-15T00:00:00.000Z',
  createdAt: '2026-11-01T00:00:00.000Z',
  jenisKelamin: { name: 'Laki-laki' },
  rating: { name: 'Sangat Baik' },
  kelompokUmur: { name: 'Dewasa' },
  ...over,
});

const values = (slices: { value: number }[]) => slices.map((s) => s.value);

describe('summarizeKepuasan — data kosong', () => {
  it('array kosong → semua kategori 0, tanpa bulan', () => {
    const s = summarizeKepuasan([]);
    expect(values(s.jenisKelamin)).toEqual([0, 0]);
    expect(values(s.rating)).toEqual([0, 0, 0, 0]);
    expect(values(s.kelompokUmur)).toEqual([0, 0, 0]);
    expect(s.monthly).toEqual([]);
    expect(hasValues(s.rating)).toBe(false);
  });

  it('null/undefined diperlakukan sama dengan kosong', () => {
    expect(summarizeKepuasan(null)).toEqual(summarizeKepuasan([]));
    expect(summarizeKepuasan(undefined)).toEqual(summarizeKepuasan([]));
  });

  it('urutan & label kategori tetap walau kosong', () => {
    const s = summarizeKepuasan([]);
    expect(s.jenisKelamin.map((x) => x.name)).toEqual(['Laki-laki', 'Perempuan']);
    expect(s.rating.map((x) => x.name)).toEqual(['Sangat Baik', 'Baik', 'Kurang Baik', 'Sangat Kurang Baik']);
    expect(s.kelompokUmur.map((x) => x.name)).toEqual(['Muda', 'Dewasa', 'Lansia']);
  });
});

describe('monthlyCounts', () => {
  it('satu bulan → satu batang berlabel nama bulan Indonesia + tahun', () => {
    expect(monthlyCounts([r(), r()])).toEqual([{ month: 'Maret 2026', short: 'Mar 2026', Responden: 2 }]);
  });

  it('beberapa bulan → urut kronologis lintas tahun, bukan urutan data', () => {
    const data = [
      r({ tanggal: '2026-02-14T00:00:00.000Z' }),
      r({ tanggal: '2025-12-10T00:00:00.000Z' }),
      r({ tanggal: '2026-02-20T00:00:00.000Z' }),
      r({ tanggal: '2026-01-05T00:00:00.000Z' }),
    ];
    expect(monthlyCounts(data)).toEqual([
      { month: 'Desember 2025', short: 'Des 2025', Responden: 1 },
      { month: 'Januari 2026', short: 'Jan 2026', Responden: 1 },
      { month: 'Februari 2026', short: 'Feb 2026', Responden: 2 },
    ]);
  });

  it('tanggal null/kosong → pakai createdAt', () => {
    expect(monthlyCounts([r({ tanggal: null }), r({ tanggal: '' })])).toEqual([
      { month: 'November 2026', short: 'Nov 2026', Responden: 2 },
    ]);
  });

  it('tanggal & createdAt null atau tak valid → dilewati', () => {
    const data = [r({ tanggal: null, createdAt: null }), r({ tanggal: 'bukan-tanggal' }), null];
    expect(monthlyCounts(data)).toEqual([]);
  });

  it('menerima objek Date', () => {
    expect(monthlyCounts([r({ tanggal: new Date(2026, 6, 15) })])).toEqual([{ month: 'Juli 2026', short: 'Jul 2026', Responden: 1 }]);
  });
});

describe('countByCategory', () => {
  it('cocok tanpa beda huruf besar/kecil; nama asing diabaikan', () => {
    const data = [
      r({ rating: { name: 'SANGAT BAIK' } }),
      r({ rating: { name: 'baik' } }),
      r({ rating: { name: 'Cukup' } }),
      r({ rating: { name: 'Kurang Baik' } }),
    ];
    expect(values(countByCategory(data, (x) => x.rating, RATING))).toEqual([1, 1, 1, 0]);
  });

  it('relasi/nama null dan item null → tidak dihitung', () => {
    const data = [r({ rating: null }), r({ rating: { name: null } }), r({ rating: undefined }), null];
    expect(values(countByCategory(data, (x) => x.rating, RATING))).toEqual([0, 0, 0, 0]);
  });

  it('membawa warna kategori dari meta', () => {
    expect(countByCategory([], (x) => x.rating, RATING).map((s) => s.color)).toEqual(RATING.map((c) => c.color));
  });
});

describe('summarizeKepuasan — campuran', () => {
  it('menghitung jenis kelamin, rating, umur, dan bulan sekaligus', () => {
    const s = summarizeKepuasan([
      r(),
      r({ jenisKelamin: { name: 'Perempuan' }, rating: { name: 'Baik' }, kelompokUmur: { name: 'Lansia' } }),
      r({ jenisKelamin: { name: 'perempuan' }, kelompokUmur: { name: 'Muda' }, tanggal: '2026-04-15T00:00:00.000Z' }),
    ]);
    expect(values(s.jenisKelamin)).toEqual([1, 2]);
    expect(values(s.rating)).toEqual([2, 1, 0, 0]);
    expect(values(s.kelompokUmur)).toEqual([1, 1, 1]);
    expect(s.monthly).toEqual([
      { month: 'Maret 2026', short: 'Mar 2026', Responden: 2 },
      { month: 'April 2026', short: 'Apr 2026', Responden: 1 },
    ]);
    expect(hasValues(s.jenisKelamin)).toBe(true);
  });
});

describe('toSelectOptions', () => {
  it('memetakan id/name ke value/label; nama kosong → label cadangan', () => {
    expect(toSelectOptions([{ id: 'a', name: 'Laki-laki' }, { id: 'b', name: '' }, { id: 'c', name: null }], 'Tanpa Nama')).toEqual([
      { value: 'a', label: 'Laki-laki' },
      { value: 'b', label: 'Tanpa Nama' },
      { value: 'c', label: 'Tanpa Nama' },
    ]);
  });

  it('entri null/undefined dibuang; daftar null → []', () => {
    expect(toSelectOptions([null, { id: 'a', name: 'Muda' }, undefined], 'x')).toEqual([{ value: 'a', label: 'Muda' }]);
    expect(toSelectOptions(null, 'x')).toEqual([]);
  });
});

describe('sumValues & formatShare', () => {
  const slices = [
    { name: 'A', value: 1, color: '#000' },
    { name: 'B', value: 2, color: '#111' },
  ];

  it('menjumlah nilai kategori', () => {
    expect(sumValues(slices)).toBe(3);
    expect(sumValues([])).toBe(0);
  });

  it('persen format Indonesia, maks 1 desimal', () => {
    // toLocaleString memakai spasi tak-putus di sebagian ICU; normalisasi sebelum dibandingkan.
    const norm = (x: string) => x.replace(/\s/g, '');
    expect(norm(formatShare(1, 3))).toBe('33,3%');
    expect(norm(formatShare(2, 2))).toBe('100%');
  });

  it('total 0 → 0% (bukan NaN)', () => {
    expect(formatShare(0, 0).replace(/\s/g, '')).toBe('0%');
  });
});
