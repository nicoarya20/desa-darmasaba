// @vitest-environment node
// Jumlah Penduduk Miskin publik: normalisasi tahun, urutan terbaru dulu, kartu tahun terbaru + selisih dari tahun terisi sebelumnya.
import { describe, expect, it } from 'vitest';
import {
  arahPerubahan,
  perubahanTahun,
  pickLatestTahun,
  sortTahunDesc,
  toPendudukMiskinTahun,
  toStatBarItems,
  type PendudukMiskinTahun,
} from '@/app/(public)/(pages)/ekonomi/jumlah-penduduk-miskin/_com/penduduk-miskin.logic';

// test-only: baris siap tampil.
const row = (tahun: number, jumlah: number | null, updatedAt: string | null = null): PendudukMiskinTahun => ({
  id: `pm${tahun}`,
  tahun,
  jumlah,
  updatedAt,
});

describe('toPendudukMiskinTahun', () => {
  it('angka & string angka diterima; updatedAt kosong → null', () => {
    expect(toPendudukMiskinTahun({ id: 'a', year: 2025, totalPoorPopulation: 390 })).toEqual({
      id: 'a',
      tahun: 2025,
      jumlah: 390,
      updatedAt: null,
    });
    expect(toPendudukMiskinTahun({ id: 'b', year: '2024', totalPoorPopulation: '1.250', updatedAt: '2026-11-02T03:00:00Z' })).toEqual({
      id: 'b',
      tahun: 2024,
      jumlah: 1250,
      updatedAt: '2026-11-02T03:00:00Z',
    });
  });

  it('tahun tak masuk akal → null; jumlah tak terbaca → jumlah null (tidak ditebak)', () => {
    expect(toPendudukMiskinTahun({ id: 'x', year: 'dua ribu', totalPoorPopulation: 1 })).toBeNull();
    expect(toPendudukMiskinTahun({ id: 'x', year: 2025.5, totalPoorPopulation: 1 })).toBeNull();
    expect(toPendudukMiskinTahun({ id: 'x', year: 1800, totalPoorPopulation: 1 })).toBeNull();
    expect(toPendudukMiskinTahun({ id: 'x', year: 3000, totalPoorPopulation: 1 })).toBeNull();
    expect(toPendudukMiskinTahun({ id: 'y', year: 2025, totalPoorPopulation: 'banyak' })?.jumlah).toBeNull();
    expect(toPendudukMiskinTahun({ id: 'y', year: 2025, totalPoorPopulation: -4 })?.jumlah).toBeNull();
  });
});

describe('urutan & tahun terbaru', () => {
  it('sortTahunDesc: terbaru dulu, masukan tidak diubah', () => {
    const input = [row(2021, 1), row(2026, 5), row(2024, 3)];
    expect(sortTahunDesc(input).map((r) => r.tahun)).toEqual([2026, 2024, 2021]);
    expect(input.map((r) => r.tahun)).toEqual([2021, 2026, 2024]);
  });

  it('pickLatestTahun: tahun terbaru yang terisi; semua kosong → null', () => {
    expect(pickLatestTahun([row(2026, null), row(2025, 390)])?.tahun).toBe(2025);
    expect(pickLatestTahun([row(2026, 5), row(2025, 390)])?.tahun).toBe(2026);
    expect(pickLatestTahun([row(2026, null)])).toBeNull();
    expect(pickLatestTahun([])).toBeNull();
  });
});

describe('perubahanTahun', () => {
  it('data stg 2026 = 5 vs 2025 = 390 → turun 385 (98,7%), bukan total lintas tahun', () => {
    const rows = [row(2026, 5), row(2025, 390), row(2024, 410), row(2023, 430)];
    const p = perubahanTahun(rows, rows[0]);
    expect(p?.selisih).toBe(-385);
    expect(p?.dari).toBe(2025);
    expect(p?.persen).toBeCloseTo(-98.718, 2);
  });

  it('pembanding = tahun terisi lebih kecil terdekat (lewati tahun kosong & tahun bolong)', () => {
    const rows = [row(2026, 400), row(2025, null), row(2022, 380)];
    const p = perubahanTahun(rows, rows[0]);
    expect(p).toEqual({ selisih: 20, persen: (20 / 380) * 100, dari: 2022 });
  });

  it('tahun lebih baru tidak dipakai sebagai pembanding, urutan masukan tak berpengaruh', () => {
    const rows = [row(2023, 100), row(2025, 300), row(2024, 200)];
    expect(perubahanTahun(rows, rows[1])?.dari).toBe(2024);
  });

  it('pembanding 0 → persen null; tanpa pembanding / latest kosong → null', () => {
    expect(perubahanTahun([row(2025, 10), row(2024, 0)], row(2025, 10))).toEqual({ selisih: 10, persen: null, dari: 2024 });
    expect(perubahanTahun([row(2025, 10)], row(2025, 10))).toBeNull();
    expect(perubahanTahun([row(2025, 10), row(2024, null)], row(2025, 10))).toBeNull();
    expect(perubahanTahun([row(2025, null), row(2024, 3)], row(2025, null))).toBeNull();
  });
});

describe('arahPerubahan & toStatBarItems', () => {
  it('arah naik / turun / tetap', () => {
    expect(arahPerubahan(3)).toBe('naik');
    expect(arahPerubahan(-1)).toBe('turun');
    expect(arahPerubahan(0)).toBe('tetap');
  });

  it('label = tahun, urutan masukan dipertahankan, nilai kosong tetap null', () => {
    expect(toStatBarItems([row(2026, 5, '2026-11-02T03:00:00Z'), row(2025, null)])).toEqual([
      { id: 'pm2026', label: '2026', value: 5, updatedAt: '2026-11-02T03:00:00Z' },
      { id: 'pm2025', label: '2025', value: null, updatedAt: null },
    ]);
  });
});
