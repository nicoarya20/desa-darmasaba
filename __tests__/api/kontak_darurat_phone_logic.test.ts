// @vitest-environment node
// Modul bersama nomor kontak darurat (Kesehatan, Keamanan, Polsek): format telepon tetap & digit untuk cari.
// Kasus seluler/tel:/wa.me utama ada di kontak_darurat_kesehatan_page_logic.test.ts.
import { describe, expect, it } from 'vitest';
import { phoneDigits, phoneInfo } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';

describe('phoneInfo: format telepon tetap', () => {
  it('pelanggan 7 digit (umum di Bali) → 3+4', () => {
    expect(phoneInfo('03618463263')?.display).toBe('(0361) 846 3263');
  });

  it('pelanggan 6 digit (nomor lama) → 3+3, bukan 2+4', () => {
    const info = phoneInfo('0361411270');
    expect(info).toEqual({ kind: 'landline', display: '(0361) 411 270', telHref: 'tel:+62361411270', waHref: null });
  });

  it('kode wilayah 2 digit dengan pelanggan 8 digit → 4+4', () => {
    expect(phoneInfo('02112345678')?.display).toBe('(021) 1234 5678');
  });

  it('nomor layanan pendek (110, 113, 115) → apa adanya, tel: tanpa +62', () => {
    for (const n of ['110', '113', '115']) {
      expect(phoneInfo(n)).toEqual({ kind: 'service', display: n, telHref: `tel:${n}`, waHref: null });
    }
  });
});

describe('phoneDigits', () => {
  it('membuang semua selain digit; null/undefined → string kosong', () => {
    expect(phoneDigits('(0361) 846-3263')).toBe('03618463263');
    expect(phoneDigits(null)).toBe('');
    expect(phoneDigits(undefined)).toBe('');
  });
});
