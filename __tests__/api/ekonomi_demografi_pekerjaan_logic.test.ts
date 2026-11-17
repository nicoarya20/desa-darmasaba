// @vitest-environment node
// Demografi Pekerjaan publik: normalisasi baris API (laki-laki + perempuan), peringkat, muat find-many dengan limit eksplisit.
import { afterEach, describe, expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: { ekonomi: { demografipekerjaan: { 'find-many': { get } } } } } }));

import {
  summarizeDemografiPekerjaan,
  toDemografiPekerjaanItem,
} from '@/app/(public)/(pages)/ekonomi/demografi-pekerjaan/_com/demografi-pekerjaan.logic';
import { loadDemografiPekerjaan } from '@/app/(public)/(pages)/ekonomi/demografi-pekerjaan/_com/demografi-pekerjaan.source';
import { DEMOGRAFI_PEKERJAAN_LIMIT } from '@/app/(public)/(pages)/ekonomi/demografi-pekerjaan/_com/demografi-pekerjaan.meta';

// test-only: bentuk baris stg 2026-11-16 (dipangkas).
const raw = (id: string, pekerjaan: string, lakiLaki: unknown, perempuan: unknown, updatedAt: unknown = '2026-11-02T06:30:14.525Z') => ({
  id,
  pekerjaan,
  lakiLaki,
  perempuan,
  updatedAt,
});

afterEach(() => {
  get.mockReset();
  vi.restoreAllMocks();
});

describe('toDemografiPekerjaanItem', () => {
  it('value = laki-laki + perempuan, segmen [laki-laki, perempuan], label dipangkas', () => {
    expect(toDemografiPekerjaanItem(raw('k', ' Karyawan Swasta ', 260, 310))).toEqual({
      id: 'k',
      label: 'Karyawan Swasta',
      value: 570,
      segments: [260, 310],
      updatedAt: '2026-11-02T06:30:14.525Z',
    });
  });

  it('0 diterima; negatif/pecahan → segmen null dan total "belum diisi"', () => {
    expect(toDemografiPekerjaanItem(raw('a', 'A', 0, 12)).value).toBe(12);
    const rusak = toDemografiPekerjaanItem(raw('b', 'B', -3, 1.5));
    expect(rusak.value).toBeNull();
    expect(rusak.segments).toEqual([null, null]);
  });

  it('updatedAt Date (Eden) dipertahankan, kosong → null', () => {
    const d = new Date('2026-11-03T06:45:42.146Z');
    expect(toDemografiPekerjaanItem(raw('c', 'C', 1, 1, d)).updatedAt).toBe(d);
    expect(toDemografiPekerjaanItem(raw('c', 'C', 1, 1, null)).updatedAt).toBeNull();
  });
});

describe('summarizeDemografiPekerjaan', () => {
  it('peringkat terbanyak dulu, belum diisi di akhir; total & total per segmen', () => {
    const sum = summarizeDemografiPekerjaan([
      toDemografiPekerjaanItem(raw('t', 'Test QA Pekerjaan', 10, 8)),
      toDemografiPekerjaanItem(raw('x', 'Rusak', -1, 2)),
      toDemografiPekerjaanItem(raw('k', 'Karyawan Swasta', 260, 310)),
    ]);
    expect(sum.rows.map((r) => r.id)).toEqual(['k', 't', 'x']);
    expect(sum.total).toBe(588);
    expect(sum.segmentTotals).toEqual([270, 318]);
    expect(sum.belumDiisi).toBe(1);
    expect(sum.latest?.toISOString()).toBe('2026-11-02T06:30:14.525Z');
  });
});

describe('loadDemografiPekerjaan', () => {
  it('meminta limit eksplisit (bukan bawaan 10) dan menormalkan baris', async () => {
    get.mockResolvedValue({ status: 200, data: { success: true, data: [raw('k', 'Karyawan Swasta', 260, 310)], total: 1 } });
    const items = await loadDemografiPekerjaan();
    expect(get).toHaveBeenCalledWith({ query: { page: 1, limit: DEMOGRAFI_PEKERJAAN_LIMIT } });
    expect(DEMOGRAFI_PEKERJAAN_LIMIT).toBeGreaterThan(10);
    expect(items[0].value).toBe(570);
  });

  it('galat API dilempar berkonteks (bukan dianggap kosong)', async () => {
    get.mockResolvedValue({ status: 500, data: { success: false, message: 'galat uji' } });
    await expect(loadDemografiPekerjaan()).rejects.toThrow(/demografi pekerjaan.*HTTP 500.*galat uji/);
  });

  it('total API > baris termuat → console.warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    get.mockResolvedValue({ status: 200, data: { success: true, data: [raw('k', 'K', 1, 1)], total: 150 } });
    await loadDemografiPekerjaan();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('1 dari 150'));
  });
});
