// @vitest-environment node
// Logika bersama halaman detail UMKM publik (detail produk & detail toko): pembaca respons detail,
// saringan tampil (dipakai MITIGASI SEMENTARA umkm-detail / umkm-detail-toko), teks bersih, dan inisial.
import { describe, expect, it } from 'vitest';
import {
  cleanText,
  inisialNama,
  isDataTampil,
  readDetailResponse,
} from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.logic';

describe('readDetailResponse', () => {
  const data = { id: 'x1' };

  it('success + data → data', () => {
    expect(readDetailResponse('detail UMKM', 'x1', 200, { success: true, data })).toBe(data);
  });

  it.each(['UMKM tidak ditemukan', 'Produk UMKM TIDAK DITEMUKAN'])('pesan %j (HTTP 200) → null', (message) => {
    expect(readDetailResponse('detail UMKM', 'x1', 200, { success: false, message })).toBeNull();
  });

  it('galat server → Error berkonteks label + id + pesan', () => {
    expect(() => readDetailResponse('detail UMKM', 'x9', 200, { success: false, message: 'Gagal mengambil' })).toThrow(
      'detail UMKM x9 gagal: Gagal mengambil',
    );
  });

  it('HTTP bukan 200 → Error dengan status; tanpa data / bentuk tak dikenal → respons tidak valid', () => {
    expect(() => readDetailResponse('detail UMKM', 'x1', 500, null)).toThrow('detail UMKM x1 gagal (HTTP 500): tanpa pesan');
    expect(() => readDetailResponse('detail UMKM', 'x1', 200, { success: true, data: null })).toThrow(/respons tidak valid/);
    expect(() => readDetailResponse('detail UMKM', 'x1', 200, undefined)).toThrow(/respons tidak valid/);
  });
});

describe('isDataTampil', () => {
  it('aktif & belum dihapus tampil; kolom kosong = aktif', () => {
    expect(isDataTampil({ deletedAt: null, isActive: true })).toBe(true);
    expect(isDataTampil({})).toBe(true);
    expect(isDataTampil({ isActive: null })).toBe(true);
  });

  it('terhapus atau nonaktif → tidak tampil', () => {
    expect(isDataTampil({ deletedAt: '2026-11-01T00:00:00.000Z' })).toBe(false);
    expect(isDataTampil({ isActive: false })).toBe(false);
  });
});

describe('cleanText', () => {
  it.each([
    [' Br. Gede ', 'Br. Gede'],
    ['   ', null],
    ['', null],
    [null, null],
    [undefined, null],
  ])('%j → %j', (input, hasil) => {
    expect(cleanText(input)).toBe(hasil);
  });
});

describe('inisialNama', () => {
  it.each([
    ['Warung Bu Made', 'WB'],
    ['kopi', 'K'],
    ['  sari   rasa  ', 'SR'],
    ['', '?'],
    ['   ', '?'],
  ])('%j → %j', (nama, hasil) => {
    expect(inisialNama(nama)).toBe(hasil);
  });
});
