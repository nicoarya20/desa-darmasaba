// @vitest-environment node
// Aturan Indeks Desa (src/lib/indeks-desa.ts): lima status resmi, tiga dimensi, dan validasi input tanpa DB.
import { describe, expect, it } from 'vitest';
import {
  DIMENSI_IDM,
  PESAN_INDEKS_DESA,
  STATUS_IDM,
  isStatusIdm,
  parseIndeksDesaInput,
} from '@/lib/indeks-desa';

const VALID = { tahun: 2030, skorIdm: 0.5, skorIks: 0.4, skorIke: 0.6, skorIkl: 0.7, status: 'Berkembang' }; // test-only

describe('konstanta IDM', () => {
  it('status resmi tepat lima dan berurutan dari terendah', () => {
    expect([...STATUS_IDM]).toEqual(['Sangat Tertinggal', 'Tertinggal', 'Berkembang', 'Maju', 'Mandiri']);
  });

  it('tiga dimensi: IKS, IKE, IKL dengan kolom skor masing-masing', () => {
    expect(DIMENSI_IDM.map((d) => [d.singkatan, d.key])).toEqual([
      ['IKS', 'skorIks'],
      ['IKE', 'skorIke'],
      ['IKL', 'skorIkl'],
    ]);
  });

  it('isStatusIdm peka huruf besar-kecil dan menolak non-string', () => {
    expect(isStatusIdm('Mandiri')).toBe(true);
    expect(isStatusIdm('mandiri')).toBe(false);
    expect(isStatusIdm(undefined)).toBe(false);
  });
});

describe('parseIndeksDesaInput', () => {
  it('input sah → data apa adanya (status tidak diturunkan dari skor), catatan kosong jadi null', () => {
    expect(parseIndeksDesaInput(VALID)).toEqual({ ok: true, data: { ...VALID, catatan: null } });
    // Skor tinggi dengan status "Tertinggal" tetap diterima: admin memasukkan apa adanya dari dokumen Kemendesa.
    expect(parseIndeksDesaInput({ ...VALID, skorIdm: 0.99, status: 'Tertinggal' })).toMatchObject({ ok: true });
  });

  it.each([NaN, Infinity, '0.5', null, undefined])('skor bukan angka berhingga (%s) ditolak', (skor) => {
    expect(parseIndeksDesaInput({ ...VALID, skorIdm: skor })).toEqual({
      ok: false,
      message: PESAN_INDEKS_DESA.skorTidakValid('Skor IDM'),
    });
  });

  it('catatan terlalu panjang ditolak', () => {
    const result = parseIndeksDesaInput({ ...VALID, catatan: 'a'.repeat(501) });
    expect(result).toEqual({ ok: false, message: PESAN_INDEKS_DESA.catatanPanjang });
  });

  it('catatan bukan teks ditolak', () => {
    expect(parseIndeksDesaInput({ ...VALID, catatan: 5 })).toEqual({ ok: false, message: PESAN_INDEKS_DESA.catatanTipe });
  });
});
