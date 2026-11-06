// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  barWidth,
  compareKode,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
  listYears,
  summarizeApbdes,
  summarizeCategory,
} from '@/app/darmasaba/_com/main-page/apbdes/apbdes.logic';
import type { APBDesItem } from '@/app/darmasaba/_com/main-page/apbdes/types/apbdes';

// test-only: bentuk data meniru APBDes 2025 (berhirarki) dan 2026 (datar) di DB lokal.
const item = (kode: string, anggaran: number, tipe: APBDesItem['tipe'], realisasi: number[] = []): APBDesItem => ({
  id: kode,
  kode,
  uraian: `Uraian ${kode}`,
  tipe,
  anggaran,
  realisasiItems: realisasi.map((jumlah, i) => ({ id: `${kode}-r${i}`, kode: `R-${kode}`, jumlah, apbDesItemId: kode })),
});

const hirarki: APBDesItem[] = [
  item('4.1.1', 150, 'pendapatan', [45, 52]),
  item('4', 1500, 'pendapatan'),
  item('4.1', 350, 'pendapatan'),
  item('4.1.2', 100, 'pendapatan', [35]),
  item('4.1.3', 100, 'pendapatan'),
  item('4.2', 800, 'pendapatan'),
  item('4.3', 200, 'pendapatan'),
  item('4.4', 150, 'pendapatan'),
  item('5.1', 400, 'belanja', [10]),
];

describe('compareKode', () => {
  it('mengurutkan per segmen numerik, induk sebelum anak', () => {
    const sorted = ['4.10', '4.2', '4', '4.1.1', '4.1'].sort(compareKode);
    expect(sorted).toEqual(['4', '4.1', '4.1.1', '4.2', '4.10']);
  });
});

describe('summarizeCategory', () => {
  it('pagu = jumlah item akar saja, tidak menghitung ganda induk + anak', () => {
    const s = summarizeCategory('pendapatan', hirarki);
    expect(s.pagu).toBe(1500);
    expect(s.realisasi).toBe(132);
    expect(s.persen).toBeCloseTo(8.8, 5);
  });

  it('baris terurut, punya kedalaman, dan realisasi induk mencakup turunannya', () => {
    const { rows } = summarizeCategory('pendapatan', hirarki);
    expect(rows.map((r) => r.kode)).toEqual(['4', '4.1', '4.1.1', '4.1.2', '4.1.3', '4.2', '4.3', '4.4']);
    const byKode = Object.fromEntries(rows.map((r) => [r.kode, r]));
    expect(byKode['4'].depth).toBe(0);
    expect(byKode['4.1'].depth).toBe(1);
    expect(byKode['4.1.1'].depth).toBe(2);
    expect(byKode['4'].realisasi).toBe(132);
    expect(byKode['4.1'].realisasi).toBe(132);
    expect(byKode['4.1.1'].realisasi).toBe(97);
    expect(byKode['4.1'].hasChildren).toBe(true);
    expect(byKode['4.1.1'].hasChildren).toBe(false);
  });

  it('data datar: semua item akar dan dijumlah', () => {
    const datar = [item('5.1.1', 8, 'belanja'), item('5.1.2', 12, 'belanja')];
    const s = summarizeCategory('belanja', datar);
    expect(s.pagu).toBe(20);
    expect(s.realisasi).toBe(0);
    expect(s.persen).toBe(0);
    expect(s.rows.every((r) => r.depth === 0)).toBe(true);
  });

  it('kategori tanpa item: pagu 0 dan persen null', () => {
    const s = summarizeCategory('pembiayaan', hirarki);
    expect(s.pagu).toBe(0);
    expect(s.persen).toBeNull();
    expect(s.rows).toEqual([]);
  });
});

describe('summarizeApbdes', () => {
  it('selalu tiga kategori dengan urutan tetap', () => {
    expect(summarizeApbdes(hirarki).map((c) => c.tipe)).toEqual(['pendapatan', 'belanja', 'pembiayaan']);
  });
});

describe('listYears', () => {
  it('unik dan terbaru di depan', () => {
    expect(listYears([{ tahun: 2025 }, { tahun: 2026 }, { tahun: 2025 }])).toEqual([2026, 2025]);
  });
});

describe('format', () => {
  it('rupiah penuh memakai titik ribuan', () => {
    expect(formatRupiah(23141290636)).toBe('Rp 23.141.290.636');
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  it('rupiah ringkas memakai satuan Indonesia, bukan B', () => {
    expect(formatRupiahCompact(23141290636)).toBe('Rp 23,14 M');
    expect(formatRupiahCompact(457952000)).toBe('Rp 457,95 Jt');
    expect(formatRupiahCompact(32e9, 1)).toBe('Rp 32 M');
    expect(formatRupiahCompact(1.2e12)).toBe('Rp 1,2 T');
    expect(formatRupiahCompact(500)).toBe('Rp 500');
  });

  it('persen satu desimal dengan koma, tanda pisah bila null', () => {
    expect(formatPercent(8.8)).toBe('8,8%');
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(null)).toBe('–');
  });

  it('lebar bar dibatasi 0–100', () => {
    expect(barWidth(140)).toBe(100);
    expect(barWidth(-5)).toBe(0);
    expect(barWidth(null)).toBe(0);
    expect(barWidth(42.5)).toBe(42.5);
  });
});
