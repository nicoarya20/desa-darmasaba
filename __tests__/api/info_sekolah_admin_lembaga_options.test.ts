// @vitest-environment node
// Pilihan lembaga di form tambah/edit siswa & pengajar (admin): semua lembaga (bukan 10 pertama), dikelompokkan
// per jenjang dengan urutan TK, SD, SMP, … mengikuti urutan baris dari API `sort=jenjang`.
import { describe, expect, it, vi } from 'vitest';

const load = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock('@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud', () => ({
  default: { lembagaPendidikan: { findMany: { load } } },
}));

import {
  LEMBAGA_OPTION_LIMIT,
  lembagaSelectData,
  loadLembagaOptions,
} from '@/app/admin/(dashboard)/pendidikan/info-sekolah/_lib/lembaga-options';

describe('loadLembagaOptions', () => {
  it('memuat jauh di atas bawaan 10, tanpa filter, urut jenjang', async () => {
    await loadLembagaOptions();
    expect(LEMBAGA_OPTION_LIMIT).toBeGreaterThan(10);
    expect(load).toHaveBeenCalledWith(1, LEMBAGA_OPTION_LIMIT, '', '', true);
  });
});

describe('lembagaSelectData', () => {
  it('grup per jenjang, urutan grup & isi mengikuti urutan baris', () => {
    const rows = [
      { id: 'tk1', nama: 'TK Satu', jenjangPendidikan: { nama: 'TK' } },
      { id: 'sd1', nama: 'SD No. 1', jenjangPendidikan: { nama: 'SD' } },
      { id: 'sd2', nama: 'SD No. 2', jenjangPendidikan: { nama: 'SD' } },
      { id: 'sma1', nama: 'SMA 1', jenjangPendidikan: { nama: 'SMA' } },
    ];
    expect(lembagaSelectData(rows)).toEqual([
      { group: 'TK', items: [{ value: 'tk1', label: 'TK Satu' }] },
      {
        group: 'SD',
        items: [
          { value: 'sd1', label: 'SD No. 1' },
          { value: 'sd2', label: 'SD No. 2' },
        ],
      },
      { group: 'SMA', items: [{ value: 'sma1', label: 'SMA 1' }] },
    ]);
  });

  it('lembaga tanpa jenjang → grup "Lainnya"; data belum dimuat → kosong', () => {
    expect(lembagaSelectData([{ id: 'x', nama: 'X', jenjangPendidikan: null }])).toEqual([
      { group: 'Lainnya', items: [{ value: 'x', label: 'X' }] },
    ]);
    expect(lembagaSelectData(null)).toEqual([]);
  });
});
