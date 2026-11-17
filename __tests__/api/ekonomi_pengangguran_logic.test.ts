// @vitest-environment node
// Modul Pengangguran (Jumlah Pengangguran + Usia Kerja yang Menganggur): normalisasi baris API, urutan kalender,
// bulan terbaru + perubahan dari bulan kalender sebelumnya, sebaran baris terbaru, dan teks perubahan.
import { describe, expect, it } from 'vitest';
import {
  arahPerubahan,
  bulanDalamTahun,
  namaPeriode,
  perubahanBulan,
  pickLatestBulan,
  pickLatestSebaran,
  porsi,
  sortBulan,
  tahunTersedia,
  toPengangguranBulan,
  toSebaran,
  type PengangguranBulan,
  type PengangguranBulanApi,
} from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/pengangguran.logic';
import { KOLOM_PENDIDIKAN, KOLOM_USIA } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/pengangguran.meta';
import { perubahanText } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/PengangguranSummary';
import { formatPerubahan } from '@/app/(public)/(pages)/ekonomi/_com/pengangguran/PengangguranTable';

// test-only
const api = (over: Partial<PengangguranBulanApi> = {}): PengangguranBulanApi => ({
  id: 'r1',
  month: 'Feb',
  year: 2026,
  totalUnemployment: 270,
  educatedUnemployment: 150,
  uneducatedUnemployment: 120,
  updatedAt: '2026-11-02T03:00:00.000Z',
  ...over,
});
// test-only
const bln = (tahun: number, bulan: number, total: number, extra: Partial<PengangguranBulan> = {}): PengangguranBulan => ({
  id: `${tahun}-${bulan}`,
  tahun,
  bulan,
  terdidik: total,
  tidakTerdidik: 0,
  total,
  updatedAt: null,
  ...extra,
});

describe('toPengangguranBulan', () => {
  it('memetakan singkatan bulan ke indeks 0–11 dan angka tersimpan', () => {
    expect(toPengangguranBulan(api())).toEqual({
      id: 'r1', tahun: 2026, bulan: 1, terdidik: 150, tidakTerdidik: 120, total: 270, updatedAt: '2026-11-02T03:00:00.000Z',
    });
    expect(toPengangguranBulan(api({ month: 'Des', year: '2025' }))?.bulan).toBe(11);
    expect(toPengangguranBulan(api({ month: 'Des', year: '2025' }))?.tahun).toBe(2025);
  });

  it('total kosong → terdidik + tidak terdidik; angka bertitik ribuan diterima', () => {
    expect(toPengangguranBulan(api({ totalUnemployment: null }))?.total).toBe(270);
    expect(toPengangguranBulan(api({ educatedUnemployment: '1.200', uneducatedUnemployment: '30', totalUnemployment: '' }))?.total).toBe(1230);
  });

  it('bulan/tahun/angka tak terbaca → null (dibuang, tidak ditebak)', () => {
    expect(toPengangguranBulan(api({ month: 'February' }))).toBeNull();
    expect(toPengangguranBulan(api({ year: 'dua ribu' }))).toBeNull();
    expect(toPengangguranBulan(api({ educatedUnemployment: '1,5' }))).toBeNull();
    expect(toPengangguranBulan(api({ uneducatedUnemployment: -3 }))).toBeNull();
  });

  it('data uji tahun 9999 tidak disaring (keputusan: tampil apa adanya)', () => {
    expect(toPengangguranBulan(api({ year: 9999 }))?.tahun).toBe(9999);
  });

  it('updatedAt kosong → null', () => {
    expect(toPengangguranBulan(api({ updatedAt: undefined }))?.updatedAt).toBeNull();
  });
});

describe('urutan & bulan terbaru', () => {
  const rows = [bln(2026, 1, 270), bln(2025, 11, 132), bln(2026, 0, 350), bln(2021, 4, 10)];

  it('sortBulan mengurut kalender naik tanpa mengubah array asal', () => {
    expect(sortBulan(rows).map((r) => r.id)).toEqual(['2021-4', '2025-11', '2026-0', '2026-1']);
    expect(rows[0].id).toBe('2026-1');
  });

  it('pickLatestBulan = periode terbesar, bukan baris terakhir di daftar', () => {
    expect(pickLatestBulan(rows)?.id).toBe('2026-1');
    expect(pickLatestBulan([...rows, bln(9999, 1, 5)])?.id).toBe('9999-1');
    expect(pickLatestBulan([])).toBeNull();
  });

  it('tahunTersedia unik, terbaru dulu', () => {
    expect(tahunTersedia(rows)).toEqual([2026, 2025, 2021]);
  });

  it('bulanDalamTahun hanya tahun itu, urut Jan → Des', () => {
    expect(bulanDalamTahun(rows, 2026).map((r) => r.bulan)).toEqual([0, 1]);
    expect(bulanDalamTahun(rows, 2030)).toEqual([]);
  });
});

describe('perubahanBulan', () => {
  it('dibanding bulan kalender tepat sebelumnya', () => {
    const rows = [bln(2026, 0, 350), bln(2026, 1, 270)];
    const p = perubahanBulan(rows, rows[1]);
    expect(p?.selisih).toBe(-80);
    expect(p?.persen).toBeCloseTo(-22.857, 2);
    expect(p?.dari.id).toBe('2026-0');
  });

  it('lintas tahun: Januari dibanding Desember tahun lalu', () => {
    const rows = [bln(2025, 11, 100), bln(2026, 0, 150)];
    expect(perubahanBulan(rows, rows[1])?.persen).toBe(50);
  });

  it('bulan sebelumnya tak tercatat → null (bukan baris sebelumnya di daftar)', () => {
    const rows = [bln(2025, 9, 100), bln(2026, 1, 150)];
    expect(perubahanBulan(rows, rows[1])).toBeNull();
  });

  it('bulan sebelumnya 0 → selisih ada, persen null', () => {
    const rows = [bln(2026, 0, 0), bln(2026, 1, 10)];
    expect(perubahanBulan(rows, rows[1])).toMatchObject({ selisih: 10, persen: null });
  });
});

describe('porsi, namaPeriode, arahPerubahan', () => {
  it('porsi dalam persen; total 0 → null', () => {
    expect(porsi(150, 300)).toBe(50);
    expect(porsi(5, 0)).toBeNull();
  });

  it('namaPeriode memakai nama bulan panjang', () => {
    expect(namaPeriode({ tahun: 2026, bulan: 1 })).toBe('Februari 2026');
    expect(namaPeriode({ tahun: 2025, bulan: 11 })).toBe('Desember 2025');
  });

  it('arahPerubahan', () => {
    expect(arahPerubahan(3)).toBe('naik');
    expect(arahPerubahan(-1)).toBe('turun');
    expect(arahPerubahan(0)).toBe('tetap');
  });
});

describe('sebaran usia/pendidikan', () => {
  const usia = { id: 'u1', usia18_25: '25', usia26_35: '18', usia36_45: '12', usia46_keatas: '10', updatedAt: '2026-11-02T00:00:00.000Z' };

  it('toSebaran: butir urut kolom (bukan peringkat), label dari meta, isian bukan bilangan → null', () => {
    const s = toSebaran({ ...usia, usia36_45: '12 orang' }, KOLOM_USIA);
    expect(s.id).toBe('u1');
    expect(s.updatedAt).toBe('2026-11-02T00:00:00.000Z');
    expect(s.items.map((i) => [i.label, i.value])).toEqual([
      ['18–25 tahun', 25],
      ['26–35 tahun', 18],
      ['36–45 tahun', null],
      ['46 tahun ke atas', 10],
    ]);
    expect(s.items[0].id).toBe('u1-usia18_25');
  });

  it('label pendidikan "SMA/SMK" dipertahankan; updatedAt kosong → createdAt', () => {
    const s = toSebaran({ id: 'p1', SD: '35', SMP: '28', SMA: '20', D3: '8', S1: '15', createdAt: '2026-07-14T00:00:00.000Z' }, KOLOM_PENDIDIKAN);
    expect(s.items.map((i) => i.label)).toEqual(['SD', 'SMP', 'SMA/SMK', 'D3', 'S1']);
    expect(s.updatedAt).toBe('2026-07-14T00:00:00.000Z');
  });

  it('pickLatestSebaran = baris terakhir diperbarui, bukan jumlah semua baris', () => {
    const lama = { id: 'a', updatedAt: '2026-07-14T00:00:00.000Z' };
    const baru = { id: 'b', updatedAt: '2026-11-02T00:00:00.000Z' };
    const tanpaUpdate = { id: 'c', createdAt: '2026-08-01T00:00:00.000Z' };
    expect(pickLatestSebaran([lama, baru, tanpaUpdate])?.id).toBe('b');
    expect(pickLatestSebaran([lama, tanpaUpdate])?.id).toBe('c');
    expect(pickLatestSebaran([])).toBeNull();
  });
});

describe('teks perubahan', () => {
  const dari = bln(2026, 0, 350);

  it('perubahanText: arah + selisih + persen + bulan pembanding', () => {
    expect(perubahanText({ selisih: -80, persen: -22.857, dari })).toBe('Turun 80 orang (22,9%) dari Januari 2026');
    expect(perubahanText({ selisih: 1200, persen: 50, dari })).toBe('Naik 1.200 orang (50%) dari Januari 2026');
  });

  it('perubahanText: persen null dihilangkan; selisih 0 → "Sama dengan"', () => {
    expect(perubahanText({ selisih: 10, persen: null, dari })).toBe('Naik 10 orang dari Januari 2026');
    expect(perubahanText({ selisih: 0, persen: 0, dari })).toBe('Sama dengan Januari 2026');
  });

  it('formatPerubahan bertanda; tanpa pembanding → "–"', () => {
    expect(formatPerubahan(4.56)).toBe('+4,6%');
    expect(formatPerubahan(-22.857)).toBe('−22,9%');
    expect(formatPerubahan(0)).toBe('0%');
    expect(formatPerubahan(null)).toBe('–');
    expect(formatPerubahan(undefined)).toBe('–');
  });
});
