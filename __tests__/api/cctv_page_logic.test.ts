// @vitest-environment node
// Halaman publik CCTV Keamanan Desa: normalisasi respons API, ringkasan status, saring cari, format "aktif terakhir".
import { afterEach, describe, expect, it, vi } from 'vitest';
import { filterCctv, formatLastActive, hasCoords, summarizeCctv } from '@/app/(public)/(pages)/keamanan/cctv/_com/cctv.logic';
import { CCTV_LIST_LIMIT } from '@/app/(public)/(pages)/keamanan/cctv/_com/cctv.meta';
import { loadCctvList, toCctvItem, toStatusKey, type CctvItem } from '@/app/(public)/(pages)/keamanan/cctv/_com/cctv.source';

// test-only: satu titik berbentuk hasil normalisasi.
const item = (id: string, extra: Partial<CctvItem> = {}): CctvItem => ({
  id,
  kode: `CCTV-${id}`,
  nama: `Titik ${id}`,
  lokasi: `Jalan ${id}`,
  latitude: -8.57,
  longitude: 115.19,
  status: 'online',
  lastActive: '2026-02-12T14:30:00.000Z',
  ...extra,
});

describe('toCctvItem / toStatusKey', () => {
  it('menormalkan status tanpa beda huruf; nilai lain = unknown', () => {
    expect(toStatusKey('Online')).toBe('online');
    expect(toStatusKey('OFFLINE')).toBe('offline');
    expect(toStatusKey('')).toBe('unknown');
    expect(toStatusKey(null)).toBe('unknown');
  });

  it('memangkas teks dan membuang koordinat tidak valid / sebelah', () => {
    const ok = toCctvItem({ id: 'a', kode: ' CCTV - 09 ', nama: 'RS', lokasi: null, latitude: -8.5, longitude: 115.1, status: 'Online', lastActive: '' });
    expect(ok).toMatchObject({ kode: 'CCTV - 09', lokasi: '', latitude: -8.5, longitude: 115.1, lastActive: null });
    expect(toCctvItem({ id: 'b', latitude: -8.5, longitude: null })).toMatchObject({ latitude: null, longitude: null });
    expect(toCctvItem({ id: 'c', latitude: 120, longitude: 115 })).toMatchObject({ latitude: null, longitude: null });
    expect(toCctvItem({ id: 'd', latitude: '-8.5', longitude: 115 })).toMatchObject({ latitude: null, longitude: null });
  });
});

describe('loadCctvList', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('memuat semua titik sekaligus (limit CCTV_LIST_LIMIT) dan menormalkan baris', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true, data: [{ id: 'x', kode: 'CCTV-01', status: 'Offline', latitude: -8.5, longitude: 115.1 }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const list = await loadCctvList();
    expect(fetchMock).toHaveBeenCalledWith(`/api/keamanan/cctv/find-many?page=1&limit=${CCTV_LIST_LIMIT}`);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 'x', status: 'offline', nama: '' });
  });

  it('melempar galat berisi status HTTP bila gagal atau bukan JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: false, message: 'Gagal mengambil data CCTV' }), { status: 200 })));
    await expect(loadCctvList()).rejects.toThrow('Gagal mengambil data CCTV');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>502</html>', { status: 502 })));
    await expect(loadCctvList()).rejects.toThrow('HTTP 502');
  });
});

describe('summarizeCctv', () => {
  it('menghitung total, online, offline, belum diisi, dan titik terpetakan', () => {
    const s = summarizeCctv([
      item('1'),
      item('2', { status: 'offline' }),
      item('3', { status: 'unknown', latitude: null, longitude: null }),
    ]);
    expect(s).toEqual({ total: 3, online: 1, offline: 1, unknown: 1, mapped: 2 });
    expect(hasCoords(item('4', { longitude: null }))).toBe(false);
  });
});

describe('filterCctv', () => {
  const list = [item('01', { nama: 'Balai Desa' }), item('09', { kode: 'CCTV - 09', nama: 'RS Kapal', lokasi: 'Kapal, Mengwi' })];

  it('kata kunci kosong = semua; cocok kode/nama/lokasi tanpa beda huruf', () => {
    expect(filterCctv(list, '  ')).toHaveLength(2);
    expect(filterCctv(list, 'balai').map((i) => i.id)).toEqual(['01']);
    expect(filterCctv(list, 'MENGWI').map((i) => i.id)).toEqual(['09']);
  });

  it('kode dengan spasi/tanda hubung berbeda tetap cocok', () => {
    expect(filterCctv(list, 'cctv-09').map((i) => i.id)).toEqual(['09']);
    expect(filterCctv(list, 'cctv 01').map((i) => i.id)).toEqual(['01']);
    expect(filterCctv(list, 'tidak ada')).toEqual([]);
  });
});

describe('formatLastActive', () => {
  const now = new Date('2026-11-12T08:00:00.000Z');

  it('relatif untuk waktu dekat', () => {
    expect(formatLastActive('2026-11-12T07:59:40.000Z', now)?.text).toBe('baru saja');
    expect(formatLastActive('2026-11-12T07:55:00.000Z', now)?.text).toBe('5 menit yang lalu');
    expect(formatLastActive('2026-11-12T05:00:00.000Z', now)?.text).toBe('3 jam yang lalu');
    expect(formatLastActive('2026-11-11T07:00:00.000Z', now)?.text).toBe('kemarin');
  });

  it('lebih lama dari batas relatif → tanggal WITA + tanggal lengkap untuk tooltip', () => {
    const out = formatLastActive('2026-02-12T14:30:00.000Z', now);
    expect(out?.text).toBe('12 Feb 2026, 22.30 WITA');
    expect(out?.full).toBe('Kamis, 12 Februari 2026 pukul 22.30 WITA');
    expect(out?.dateTime).toBe('2026-02-12T14:30:00.000Z');
  });

  it('kosong atau tidak valid → null (ditulis "belum tercatat" oleh UI)', () => {
    expect(formatLastActive(null, now)).toBeNull();
    expect(formatLastActive('bukan tanggal', now)).toBeNull();
  });
});
