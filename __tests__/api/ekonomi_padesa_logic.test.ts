// @vitest-environment node
// Pendapatan Asli Desa publik: pos 4.1 APBDes tahun terbaru (ringkasan, porsi, selisih tahun sebelumnya, keadaan kosong).
import { describe, expect, it } from 'vitest';
import {
  apbdesWithPades,
  buildPadesView,
  isPadesItem,
  padesItems,
  padesPorsi,
} from '@/app/(public)/(pages)/ekonomi/PADesa-pendapatan-asli-desa/_com/padesa.logic';
import { PADESA_TEXT } from '@/app/(public)/(pages)/ekonomi/PADesa-pendapatan-asli-desa/_com/padesa.text';
import type { APBDes, APBDesItem } from '@/app/(public)/_com/main-page/apbdes/types/apbdes';

// test-only: bentuk data meniru APBDes stg 2026-11-16 (2025 berhirarki, 2026 datar).
const item = (kode: string, anggaran: number, tipe: APBDesItem['tipe'] = 'pendapatan', realisasi: number[] = [], updatedAt?: string): APBDesItem => ({
  id: kode,
  kode,
  uraian: `Uraian ${kode}`,
  tipe,
  anggaran,
  updatedAt,
  realisasiItems: realisasi.map((jumlah, i) => ({ id: `${kode}-r${i}`, kode: `R-${kode}`, jumlah, apbDesItemId: kode })),
});
const apbdes = (tahun: number, items: APBDesItem[], updatedAt = '2026-01-01T00:00:00.000Z'): APBDes => ({
  id: `apb-${tahun}`,
  tahun,
  jumlah: 0,
  items,
  updatedAt,
});

const tahun2025 = apbdes(2025, [
  item('4', 1_500_000_000),
  item('4.1', 350_000_000),
  item('4.1.1', 150_000_000, 'pendapatan', [50_000_000]),
  item('4.1.2', 100_000_000),
  item('4.1.3', 100_000_000),
  item('4.2', 1_150_000_000),
  item('5', 1_500_000_000, 'belanja'),
  item('6', 350_000_000, 'pembiayaan'),
]);
const tahun2026 = apbdes(2026, [
  item('4.1.1', 20_000_000, 'pendapatan', [], '2026-11-02T06:30:19.029Z'),
  item('4.2.1', 457_952_000),
  item('4.10', 5_000_000),
  item('5.1.1', 8_000_089_216, 'belanja'),
]);

describe('isPadesItem / padesItems', () => {
  it('hanya kode 4.1 dan turunannya; 4.10 dan 4.2.x bukan PADes', () => {
    expect(['4.1', '4.1.1', '4.1.3.2', ' 4.1.2 '].every((kode) => isPadesItem({ kode }))).toBe(true);
    expect(['4', '4.10', '4.11.1', '4.2.1', '5.1', '14.1'].some((kode) => isPadesItem({ kode }))).toBe(false);
  });

  it('tipe dipaksa "pendapatan" agar pos 4.1 tanpa tipe tetap terhitung', () => {
    const list = padesItems([item('4.1.1', 10, null), item('5.1', 10, 'belanja')]);
    expect(list).toHaveLength(1);
    expect(list[0].tipe).toBe('pendapatan');
  });
});

describe('apbdesWithPades', () => {
  it('membuang tahun tanpa pos 4.1 / tanpa tahun, urut tahun terbesar dulu (bukan urutan API createdAt)', () => {
    const tanpaPades = apbdes(2027, [item('4.2.1', 1)]);
    const result = apbdesWithPades([tahun2025, tanpaPades, tahun2026]);
    expect(result.map((a) => a.tahun)).toEqual([2026, 2025]);
  });
});

describe('padesPorsi', () => {
  it('porsi persen; null bila pendapatan 0, PADes 0, atau PADes melebihi pendapatan (data tak konsisten)', () => {
    expect(padesPorsi(350, 1500)).toBeCloseTo(23.333, 2);
    expect(padesPorsi(10, 0)).toBeNull();
    expect(padesPorsi(0, 100)).toBeNull();
    expect(padesPorsi(200, 100)).toBeNull();
  });
});

describe('buildPadesView', () => {
  it('tanpa APBDes → noApbdes; APBDes tanpa pos 4.1 → noPades (bukan Rp 0)', () => {
    expect(buildPadesView([])).toEqual({ kind: 'noApbdes' });
    expect(buildPadesView([apbdes(2026, [item('4.2.1', 10)]), apbdes(2025, [])])).toEqual({ kind: 'noPades' });
  });

  it('hirarki 2025: total = pos akar 4.1 (tidak menghitung ganda anaknya), realisasi dari turunan, porsi dari Pendapatan', () => {
    const view = buildPadesView([tahun2025]);
    if (view.kind !== 'ready') throw new Error(`harus ready, dapat ${view.kind}`);
    const s = view.summary;
    expect(s.tahun).toBe(2025);
    expect(s.pagu).toBe(350_000_000);
    expect(s.realisasi).toBe(50_000_000);
    expect(s.persen).toBeCloseTo(14.2857, 3);
    expect(s.rows.map((r) => [r.kode, r.depth, r.hasChildren])).toEqual([
      ['4.1', 0, true],
      ['4.1.1', 1, false],
      ['4.1.2', 1, false],
      ['4.1.3', 1, false],
    ]);
    expect(s.pendapatanPagu).toBe(1_500_000_000);
    expect(s.porsi).toBeCloseTo(23.333, 2);
    expect(s.previous).toBeNull();
  });

  it('tahun terbaru yang punya 4.1 dipakai + selisih terhadap tahun PADes sebelumnya; tanggal dari pos PADes', () => {
    const view = buildPadesView([tahun2025, tahun2026]);
    if (view.kind !== 'ready') throw new Error(`harus ready, dapat ${view.kind}`);
    const s = view.summary;
    expect(s.tahun).toBe(2026);
    expect(s.pagu).toBe(20_000_000);
    expect(s.rows.map((r) => r.kode)).toEqual(['4.1.1']);
    expect(s.realisasi).toBe(0);
    expect(s.previous).toEqual({ tahun: 2025, pagu: 350_000_000, selisih: -330_000_000 });
    expect(s.updated?.toISOString()).toBe('2026-11-02T06:30:19.029Z');
  });

  it('APBDes lebih baru tanpa pos 4.1 tidak menutupi tahun PADes terakhir', () => {
    const view = buildPadesView([apbdes(2027, [item('5.1', 1, 'belanja')]), tahun2025]);
    expect(view.kind === 'ready' && view.summary.tahun).toBe(2025);
  });
});

describe('PADESA_TEXT.delta', () => {
  it('naik/turun ringkas dan netral; sama → "Sama dengan"', () => {
    expect(PADESA_TEXT.delta(-330_000_000, 2025)).toBe('Turun Rp 330 Jt dari tahun 2025');
    expect(PADESA_TEXT.delta(1_250_000_000, 2025)).toBe('Naik Rp 1,25 M dari tahun 2025');
    expect(PADESA_TEXT.delta(0, 2025)).toBe('Sama dengan tahun 2025');
  });

  it('teks UI tanpa em dash', () => {
    const all = JSON.stringify(PADESA_TEXT);
    expect(all).not.toContain('—');
  });
});
