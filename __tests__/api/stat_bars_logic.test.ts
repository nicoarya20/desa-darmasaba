// @vitest-environment node
// Modul bersama stat-bars: parse jumlah, total/persen/lebar batang, total per segmen, urutan peringkat.
import { describe, expect, it } from 'vitest';
import {
  compareStatValueDesc,
  formatJumlah,
  latestUpdate,
  parseJumlah,
  summarizeStatBars,
  type StatBarItem,
} from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { statSegmentColor } from '@/app/(public)/_com/stat-bars/stat-bars.meta';

// test-only
const item = (id: string, value: number | null, segments?: (number | null)[]): StatBarItem => ({ id, label: id.toUpperCase(), value, segments });

describe('parseJumlah & formatJumlah', () => {
  it('bulat polos / titik ribuan diterima, selain itu null', () => {
    expect(parseJumlah('1.200')).toBe(1200);
    expect(parseJumlah(42)).toBe(42);
    expect(parseJumlah('1,5')).toBeNull();
    expect(parseJumlah(-3)).toBeNull();
    expect(parseJumlah(null)).toBeNull();
  });

  it('format gaya Indonesia', () => {
    expect(formatJumlah(2695)).toBe('2.695');
  });
});

describe('summarizeStatBars', () => {
  it('urutan masukan dipertahankan tanpa compare; persen dari total, lebar dari nilai terbesar', () => {
    const sum = summarizeStatBars([item('a', 100), item('b', 300)]);
    expect(sum.rows.map((r) => [r.id, r.share, r.width])).toEqual([
      ['a', 25, (100 / 300) * 100],
      ['b', 75, 100],
    ]);
    expect(sum.total).toBe(400);
    expect(sum.segmentTotals).toBeNull();
  });

  it('compare peringkat: terbesar dulu, belum diisi di akhir, nilai sama tetap urutan asal', () => {
    const sum = summarizeStatBars([item('x', null), item('a', 5), item('b', 9), item('c', 5)], { compare: compareStatValueDesc });
    expect(sum.rows.map((r) => r.id)).toEqual(['b', 'a', 'c', 'x']);
    expect(sum.belumDiisi).toBe(1);
  });

  it('belum diisi tanpa persen/batang; semua 0 → persen null', () => {
    const sum = summarizeStatBars([item('a', null)]);
    expect(sum.total).toBeNull();
    expect(sum.rows[0]).toMatchObject({ share: null, width: 0 });
    expect(summarizeStatBars([item('z', 0)]).rows[0]).toMatchObject({ share: null, width: 0 });
  });

  it('total per segmen hanya dari baris terisi; segmen null dihitung 0', () => {
    const sum = summarizeStatBars([item('a', 570, [260, 310]), item('b', 18, [10, null]), item('c', null, [5, 5])]);
    expect(sum.segmentTotals).toEqual([270, 310]);
  });

  it('kosong → tanpa baris, total & latest null', () => {
    const sum = summarizeStatBars([]);
    expect(sum).toMatchObject({ rows: [], total: null, belumDiisi: 0, latest: null, segmentTotals: null });
  });
});

describe('latestUpdate & warna segmen', () => {
  it('updatedAt terbaru, tanggal rusak/kosong diabaikan', () => {
    expect(latestUpdate([{ updatedAt: '2026-11-02T06:30:14.525Z' }, { updatedAt: 'rusak' }, { updatedAt: null }])?.toISOString()).toBe(
      '2026-11-02T06:30:14.525Z',
    );
    expect(latestUpdate([{}])).toBeNull();
  });

  it('segmen ke-4 dst. memakai warna terakhir', () => {
    expect(statSegmentColor(0)).toBe('var(--stat-seg-0)');
    expect(statSegmentColor(5)).toBe('var(--stat-seg-2)');
  });
});
