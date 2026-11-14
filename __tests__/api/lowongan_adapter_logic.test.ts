// @vitest-environment node
// Lowongan kerja publik: adapter API → daftar (gaji teks bebas, kunci saring, ringkasan, waktu tayang),
// format kartu (gaji, tanggal WITA, rute), dan sumber data (batas muat, peringatan terpotong, galat).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { lowonganGet } = vi.hoisted(() => ({ lowonganGet: vi.fn() }));
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { ekonomi: { lowongankerja: { 'find-many': { get: lowonganGet } } } } },
}));

import {
  DESA_KATA_KUNCI,
  GAJI_MIN_WAJAR,
  parseGaji,
  tayangMsOf,
  toKey,
  toLowongan,
  type LowonganApiItem,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-adapter.logic';
import {
  formatGaji,
  formatTanggalTayang,
  lowonganHref,
  tanggalTayangIso,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-card.logic';
import { LOWONGAN_LIST_LIMIT } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-filter.meta';
import { loadLowongan } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan.source';

// test-only: bentuk item find-many (kolom yang dibaca adapter + kolom yang sengaja diabaikan).
const api = (over: Partial<LowonganApiItem> = {}): LowonganApiItem => ({
  id: 'l1',
  posisi: 'Barista',
  namaPerusahaan: 'Warung Sari',
  lokasi: 'Jl. Raya Darmasaba No. 1',
  tipePekerjaan: 'Full Time',
  gaji: '2.500.000',
  deskripsi: 'Meracik kopi untuk pelanggan.',
  tanggalPosting: '2026-07-01T02:00:00.000Z',
  createdAt: '2026-11-03T02:00:00.000Z',
  ...over,
});

describe('parseGaji', () => {
  it('membaca nominal bertitik dan tanpa titik', () => {
    expect(parseGaji('2.500.000')).toBe(2500000);
    expect(parseGaji('2000000')).toBe(2000000);
    expect(parseGaji('Rp 3.000.000')).toBe(3000000);
  });

  it('tanpa digit → null', () => {
    expect(parseGaji('')).toBeNull();
    expect(parseGaji('   ')).toBeNull();
    expect(parseGaji('Nego')).toBeNull();
  });

  it('singkatan dan nominal di bawah GAJI_MIN_WAJAR → null, supaya "1,5jt" tidak tampil sebagai Rp15', () => {
    expect(parseGaji('1,5jt')).toBeNull();
    expect(parseGaji('3 juta')).toBeNull();
    expect(parseGaji('2.500')).toBeNull();
    expect(parseGaji(String(GAJI_MIN_WAJAR - 1))).toBeNull();
    expect(parseGaji(String(GAJI_MIN_WAJAR))).toBe(GAJI_MIN_WAJAR);
  });

  it('awalan Rp dan akhiran ",-" tidak mengubah nominal', () => {
    expect(parseGaji('Rp 2.500.000')).toBe(2500000);
    expect(parseGaji('Rp2.500.000,-')).toBe(2500000);
    expect(parseGaji('  2.500.000 / bulan ')).toBe(2500000);
    expect(parseGaji('2,500,000')).toBe(2500000);
  });

  it('desimal di akhir dibuang, bukan ikut jadi digit', () => {
    expect(parseGaji('2.500.000,00')).toBe(2500000);
    expect(parseGaji('2.500.000,5')).toBe(2500000);
    expect(parseGaji('Rp 2000000,00 ')).toBe(2000000);
  });

  it('lebih dari satu angka (rentang) → null, bukan digabung jadi satu nominal', () => {
    expect(parseGaji('500.000-900.000')).toBeNull();
    expect(parseGaji('2.000.000 - 3.000.000')).toBeNull();
    expect(parseGaji('2 s/d 3 juta')).toBeNull();
    expect(parseGaji('2.500.000 (UMK 2026)')).toBeNull();
  });

  it('lebih dari 12 digit → null', () => {
    expect(parseGaji('999999999999')).toBe(999999999999);
    expect(parseGaji('1000000000000')).toBeNull();
  });
});

describe('toKey', () => {
  it('trim, spasi dirapikan, huruf kecil', () => {
    expect(toKey(' Full  Time ')).toBe('full time');
    expect(toKey('PT\tMaju\n Jaya')).toBe('pt maju jaya');
    expect(toKey('   ')).toBe('');
  });
});

describe('toLowongan', () => {
  it('memetakan item API ke bentuk daftar', () => {
    expect(toLowongan(api())).toEqual({
      id: 'l1',
      posisi: 'Barista',
      pemberiKerja: 'Warung Sari',
      tipe: 'Full Time',
      tipeKey: 'full time',
      lokasi: 'Jl. Raya Darmasaba No. 1',
      diDesa: true,
      gaji: 2500000,
      ringkasan: 'Meracik kopi untuk pelanggan.',
      tayangMs: Date.parse('2026-11-03T02:00:00.000Z'),
    });
  });

  it('tipe dirapikan apa adanya dan diberi kunci huruf kecil', () => {
    const out = toLowongan(api({ tipePekerjaan: ' Full  Time ' }));
    expect(out.tipe).toBe('Full Time');
    expect(out.tipeKey).toBe('full time');
  });

  it('tipe selain Full Time dibaca dari data, bukan diseragamkan', () => {
    expect(toLowongan(api({ tipePekerjaan: 'Freelance' }))).toMatchObject({ tipe: 'Freelance', tipeKey: 'freelance' });
    expect(toLowongan(api({ tipePekerjaan: 'Menjaga Toko' })).tipeKey).toBe('menjaga toko');
  });

  it('tipe dan lokasi kosong → null', () => {
    const out = toLowongan(api({ tipePekerjaan: '  ', lokasi: ' ' }));
    expect(out.tipe).toBeNull();
    expect(out.tipeKey).toBeNull();
    expect(out.lokasi).toBeNull();
  });

  it('pemberi kerja hanya di-trim; tidak ada kunci pemberi lagi', () => {
    const out = toLowongan(api({ namaPerusahaan: '  Warung  SARI ' }));
    expect(out.pemberiKerja).toBe('Warung  SARI');
    expect(out).not.toHaveProperty('pemberiKey');
  });

  it('diDesa: lokasi memuat kata Darmasaba, tanpa beda huruf besar dan di posisi mana pun', () => {
    expect(DESA_KATA_KUNCI).toBe('darmasaba');
    expect(toLowongan(api({ lokasi: 'Jl. Raya Darmasaba No. 1' })).diDesa).toBe(true);
    expect(toLowongan(api({ lokasi: 'JL. RAYA DARMASABA' })).diDesa).toBe(true);
    expect(toLowongan(api({ lokasi: 'darmasaba, Abiansemal, Badung' })).diDesa).toBe(true);
    expect(toLowongan(api({ lokasi: '  Br. Dinas Tengah, Desa Darmasaba ' })).diDesa).toBe(true);
  });

  it('diDesa: alamat tanpa kata Darmasaba atau kosong → false (keterbatasan tebakan dari teks alamat)', () => {
    expect(toLowongan(api({ lokasi: 'Jl. Sunset Road, Kuta' })).diDesa).toBe(false);
    expect(toLowongan(api({ lokasi: 'Toko Bangunan KBSM Jl. Antasura No.22' })).diDesa).toBe(false);
    expect(toLowongan(api({ lokasi: '' })).diDesa).toBe(false);
    expect(toLowongan(api({ lokasi: '   ' })).diDesa).toBe(false);
  });

  it('gaji teks bebas → angka atau null', () => {
    expect(toLowongan(api({ gaji: '2000000' })).gaji).toBe(2000000);
    expect(toLowongan(api({ gaji: '1,5jt' })).gaji).toBeNull();
    expect(toLowongan(api({ gaji: '' })).gaji).toBeNull();
    expect(toLowongan(api({ gaji: '2.500.000,00' })).gaji).toBe(2500000);
    expect(toLowongan(api({ gaji: '500.000-900.000' })).gaji).toBeNull();
  });

  it('deskripsi HTML editor → teks polos satu baris', () => {
    const html = '<p>Melayani <strong>pelanggan</strong> &amp; kasir.</p><ul><li>Shift pagi</li><li>Shift&nbsp;sore</li></ul>';
    const out = toLowongan(api({ deskripsi: html })).ringkasan;
    expect(out).toBe('Melayani pelanggan & kasir. Shift pagi Shift sore');
    expect(out).not.toMatch(/[<>]/);
  });

  it('deskripsi kosong → ringkasan kosong', () => {
    expect(toLowongan(api({ deskripsi: '<p><br></p>' })).ringkasan).toBe('');
  });

  it('kolom yang tidak dipakai daftar (notelp, kualifikasi, isActive) tidak ikut terbawa', () => {
    const raw = { ...api(), notelp: '081234567890', kualifikasi: '<p>SMA</p>', isActive: true };
    const out = toLowongan(raw);
    expect(Object.keys(out).sort()).toEqual(
      ['diDesa', 'gaji', 'id', 'lokasi', 'pemberiKerja', 'posisi', 'ringkasan', 'tayangMs', 'tipe', 'tipeKey'].sort(),
    );
    expect(JSON.stringify(out)).not.toContain('081234567890');
  });
});

describe('tayangMsOf', () => {
  it('memakai createdAt; tak terbaca → tanggalPosting; keduanya rusak → 0', () => {
    const posting = '2026-04-10T01:00:00.000Z';
    expect(tayangMsOf({ createdAt: '2026-07-01T00:00:00.000Z', tanggalPosting: posting })).toBe(Date.parse('2026-07-01T00:00:00.000Z'));
    expect(tayangMsOf({ createdAt: 'bukan tanggal', tanggalPosting: posting })).toBe(Date.parse(posting));
    expect(tayangMsOf({ createdAt: '', tanggalPosting: posting })).toBe(Date.parse(posting));
    expect(tayangMsOf({ createdAt: 'rusak', tanggalPosting: '' })).toBe(0);
    expect(toLowongan(api({ createdAt: 'rusak', tanggalPosting: 'rusak juga' })).tayangMs).toBe(0);
  });
});

describe('format kartu', () => {
  it('formatGaji: Rp tanpa spasi dengan titik ribuan', () => {
    expect(formatGaji(2500000)).toBe('Rp2.500.000');
    expect(formatGaji(2000000)).toBe('Rp2.000.000');
    expect(formatGaji(15000000)).toBe('Rp15.000.000');
  });

  it('formatTanggalTayang: tanggal panjang zona WITA, bukan UTC', () => {
    expect(formatTanggalTayang(Date.parse('2026-11-03T02:00:00.000Z'))).toBe('3 November 2026');
    // 16.30 UTC tanggal 2 = 00.30 WITA tanggal 3.
    expect(formatTanggalTayang(Date.parse('2026-11-02T16:30:00.000Z'))).toBe('3 November 2026');
    expect(formatTanggalTayang(Date.parse('2026-04-09T15:59:00.000Z'))).toBe('9 April 2026');
  });

  it('waktu tak terbaca → null (tanggal dan ISO)', () => {
    for (const ms of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(formatTanggalTayang(ms)).toBeNull();
      expect(tanggalTayangIso(ms)).toBeNull();
    }
  });

  it('tanggalTayangIso mengembalikan ISO 8601 dan lowonganHref rute detail', () => {
    expect(tanggalTayangIso(Date.parse('2026-11-03T02:00:00.000Z'))).toBe('2026-11-03T02:00:00.000Z');
    expect(lowonganHref('abc-123')).toBe('/ekonomi/lowongan-kerja-lokal/abc-123');
  });
});

describe('lowongan.source', () => {
  beforeEach(() => {
    lowonganGet.mockReset();
  });

  it('memuat satu halaman sebesar batas muat lalu dipetakan lewat adapter', async () => {
    lowonganGet.mockResolvedValue({ status: 200, data: { success: true, total: 2, data: [api(), api({ id: 'l2', gaji: '' })] } });
    const out = await loadLowongan();
    expect(lowonganGet).toHaveBeenCalledTimes(1);
    expect(lowonganGet).toHaveBeenCalledWith({ query: { page: 1, limit: LOWONGAN_LIST_LIMIT } });
    expect(out.map((l) => l.id)).toEqual(['l1', 'l2']);
    expect(out[0]).toMatchObject({ pemberiKerja: 'Warung Sari', diDesa: true, gaji: 2500000 });
    expect(out[1].gaji).toBeNull();
  });

  it('total > yang dimuat → console.warn; total sama → diam', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    lowonganGet.mockResolvedValue({ status: 200, data: { success: true, total: 150, data: [api()] } });
    await loadLowongan();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('150 lowongan'));

    warn.mockClear();
    lowonganGet.mockResolvedValue({ status: 200, data: { success: true, total: 1, data: [api()] } });
    await loadLowongan();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('respons gagal → Error berkonteks (tidak ditelan)', async () => {
    lowonganGet.mockResolvedValue({ status: 200, data: { success: false, message: 'Gagal mengambil data lowongan kerja' } });
    await expect(loadLowongan()).rejects.toThrow('find-many lowongan kerja gagal (HTTP 200): Gagal mengambil data lowongan kerja');
    lowonganGet.mockResolvedValue({ status: 500, data: null });
    await expect(loadLowongan()).rejects.toThrow('find-many lowongan kerja gagal (HTTP 500): respons tidak valid');
  });
});
