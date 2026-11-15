// @vitest-environment node
// Halaman publik Data Pendidikan: parse jumlah ketat, urut jenjang, total/persen, normalisasi & muat API.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatJumlah,
  parseJumlah,
  sortByJenjang,
  summarizeDataPendidikan,
  type DataPendidikanItem,
} from '@/app/(public)/(pages)/pendidikan/data-pendidikan/_com/data-pendidikan.logic';
import { loadDataPendidikan, toDataPendidikanItem } from '@/app/(public)/(pages)/pendidikan/data-pendidikan/_com/data-pendidikan.source';
import { DATA_PENDIDIKAN_LIMIT } from '@/app/(public)/(pages)/pendidikan/data-pendidikan/_com/data-pendidikan.meta';

// test-only
const item = (id: string, nama: string, jumlah: number | null, updatedAt: string | null = null): DataPendidikanItem => ({ id, nama, jumlah, updatedAt });

describe('parseJumlah', () => {
  it('menerima bilangan bulat polos dan titik ribuan', () => {
    expect(parseJumlah('874')).toBe(874);
    expect(parseJumlah(' 1.200 ')).toBe(1200);
    expect(parseJumlah('1.234.567')).toBe(1234567);
    expect(parseJumlah('0')).toBe(0);
    expect(parseJumlah(42)).toBe(42);
  });

  it('menolak isian yang tidak bisa dipastikan (bukan ditebak)', () => {
    for (const v of ['', '  ', '1,5', '1.20', '12.0000', '1200 orang', '-5', 'abc', null, undefined, 1.5, -1, Number.NaN]) {
      expect(parseJumlah(v)).toBeNull();
    }
  });
});

describe('sortByJenjang', () => {
  it('urut jenjang baku, jenjang lain di belakang, nama ganda tetap berurutan seperti API', () => {
    const api = [
      item('pt', 'Perguruan Tinggi', 250),
      item('sd1', 'SD', 874),
      item('sd2', 'SD', 90),
      item('sma', 'SMA', 862),
      item('smp', 'SMP', 50),
      item('tk', 'TK', 120),
    ];
    expect(sortByJenjang(api).map((i) => i.id)).toEqual(['tk', 'sd1', 'sd2', 'smp', 'sma', 'pt']);
  });
});

describe('summarizeDataPendidikan', () => {
  it('total, persen porsi dari total, batang relatif ke nilai terbesar', () => {
    const sum = summarizeDataPendidikan([item('sd', 'SD', 800), item('tk', 'TK', 200)]);
    expect(sum.total).toBe(1000);
    expect(sum.rows.map((r) => [r.nama, r.share, r.width])).toEqual([
      ['TK', 20, 25],
      ['SD', 80, 100],
    ]);
    expect(sum.belumDiisi).toBe(0);
  });

  it('baris ganda tidak digabung', () => {
    const sum = summarizeDataPendidikan([item('a', 'SD', 874), item('b', 'SD', 90)]);
    expect(sum.rows).toHaveLength(2);
    expect(sum.total).toBe(964);
  });

  it('baris belum diisi tidak ikut total/persen dan tanpa batang', () => {
    const sum = summarizeDataPendidikan([item('sd', 'SD', 300), item('smp', 'SMP', null)]);
    expect(sum.total).toBe(300);
    expect(sum.belumDiisi).toBe(1);
    const smp = sum.rows.find((r) => r.id === 'smp')!;
    expect(smp.share).toBeNull();
    expect(smp.width).toBe(0);
  });

  it('tak satu pun terisi → total null; semua 0 → persen null (tidak ditulis 0%)', () => {
    expect(summarizeDataPendidikan([item('sd', 'SD', null)]).total).toBeNull();
    const zero = summarizeDataPendidikan([item('sd', 'SD', 0)]);
    expect(zero.total).toBe(0);
    expect(zero.rows[0].share).toBeNull();
    expect(zero.rows[0].width).toBe(0);
  });

  it('waktu pembaruan = updatedAt terbaru, tanggal rusak diabaikan', () => {
    const sum = summarizeDataPendidikan([
      item('a', 'SD', 1, '2026-09-01T08:46:28.315Z'),
      item('b', 'TK', 1, '2026-11-02T06:30:18.496Z'),
      item('c', 'SMP', 1, 'bukan tanggal'),
    ]);
    expect(sum.latest?.toISOString()).toBe('2026-11-02T06:30:18.496Z');
    expect(summarizeDataPendidikan([]).latest).toBeNull();
  });

  it('formatJumlah gaya Indonesia', () => {
    expect(formatJumlah(1906)).toBe('1.906');
  });
});

describe('source', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('toDataPendidikanItem menormalkan baris mentah', () => {
    expect(toDataPendidikanItem({ id: 'x', name: ' SD ', jumlah: '1.200', updatedAt: '2026-11-02T06:30:18.496Z' })).toEqual({
      id: 'x',
      nama: 'SD',
      jumlah: 1200,
      updatedAt: '2026-11-02T06:30:18.496Z',
    });
    expect(toDataPendidikanItem({ id: 'y', name: null, jumlah: 'abc' })).toEqual({ id: 'y', nama: '', jumlah: null, updatedAt: null });
  });

  it('memuat semua kategori dengan limit halaman', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [{ id: 'a', name: 'SD', jumlah: '874' }], total: 1 }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const items = await loadDataPendidikan();
    expect(fetchMock).toHaveBeenCalledWith(`/api/pendidikan/datapendidikan/findMany?page=1&limit=${DATA_PENDIDIKAN_LIMIT}`);
    expect(items).toEqual([{ id: 'a', nama: 'SD', jumlah: 874, updatedAt: null }]);
  });

  it('galat HTTP atau success:false dilempar (tidak tampil sebagai kosong)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Bad Gateway', { status: 502 })));
    await expect(loadDataPendidikan()).rejects.toThrow('HTTP 502');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, message: 'gagal' }), { status: 200 })));
    await expect(loadDataPendidikan()).rejects.toThrow('gagal');
  });

  it('memperingatkan bila kategori melebihi limit (mitigasi sementara)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: [{ id: 'a', name: 'SD', jumlah: '1' }], total: 150 }), { status: 200 })),
    );
    await loadDataPendidikan();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('1 dari 150'));
  });
});
