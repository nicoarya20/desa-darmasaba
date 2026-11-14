// @vitest-environment node
// Helper murni Info Sekolah publik: URL tabel (?jenjang=&search=&page=), opsi filter jenjang, pesan kosong.
import { describe, expect, it } from 'vitest';
import {
  buildListHref,
  emptyMessage,
  INFO_SEKOLAH_PATH,
  jenjangOptions,
} from '@/app/(public)/(pages)/pendidikan/info-sekolah/_com/info-sekolah.logic';

const LEMBAGA = `${INFO_SEKOLAH_PATH}/lembaga`;

describe('buildListHref', () => {
  it('tanpa filter → path polos', () => {
    expect(buildListHref(LEMBAGA)).toBe(LEMBAGA);
    expect(buildListHref(LEMBAGA, { jenjang: '', search: '  ', page: 1 })).toBe(LEMBAGA);
  });

  it('menulis jenjang (huruf kecil), kata kunci, dan halaman > 1', () => {
    expect(buildListHref(LEMBAGA, { jenjang: 'SD' })).toBe(`${LEMBAGA}?jenjang=sd`);
    expect(buildListHref(LEMBAGA, { jenjang: 'sd', search: ' negeri 1 ', page: 3 })).toBe(
      `${LEMBAGA}?jenjang=sd&search=negeri+1&page=3`,
    );
  });

  it('halaman 1 tidak ditulis', () => {
    expect(buildListHref(LEMBAGA, { jenjang: 'smp', page: 1 })).toBe(`${LEMBAGA}?jenjang=smp`);
  });

  it('meng-encode kata kunci berisi karakter khusus', () => {
    expect(buildListHref(LEMBAGA, { search: 'a&b=c' })).toBe(`${LEMBAGA}?search=a%26b%3Dc`);
  });
});

describe('jenjangOptions', () => {
  it('value huruf kecil (sama dengan URL), label nama asli', () => {
    expect(jenjangOptions(['SD', 'SMP'], '')).toEqual([
      { value: 'sd', label: 'SD' },
      { value: 'smp', label: 'SMP' },
    ]);
  });

  it('jenjang aktif yang belum ada di daftar tetap muncul (daftar masih memuat / URL ngawur)', () => {
    expect(jenjangOptions([], 'SMA')).toEqual([{ value: 'sma', label: 'SMA' }]);
    expect(jenjangOptions(['SD'], 'xyz')).toEqual([
      { value: 'sd', label: 'SD' },
      { value: 'xyz', label: 'xyz' },
    ]);
  });

  it('jenjang aktif yang sudah ada tidak diduplikasi (beda kapitalisasi)', () => {
    expect(jenjangOptions(['SD', 'SMP'], 'Sd')).toHaveLength(2);
  });
});

describe('emptyMessage', () => {
  it.each([
    [{ jenjang: '', search: '' }, 'Belum ada data lembaga.'],
    [{ jenjang: 'sd', search: '' }, 'Belum ada data lembaga di jenjang SD.'],
    [{ jenjang: '', search: 'zzz' }, 'Tidak ada lembaga yang cocok dengan “zzz”.'],
    [{ jenjang: 'sd', search: 'zzz' }, 'Tidak ada lembaga “zzz” di jenjang SD.'],
  ])('%j → %s', (query, expected) => {
    expect(emptyMessage('lembaga', query)).toBe(expected);
  });
});
