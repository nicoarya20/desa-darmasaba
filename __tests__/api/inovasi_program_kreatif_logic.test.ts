// @vitest-environment node
// Program Kreatif Desa publik: normalisasi item, URL, aturan kolom cari, pemetaan "tidak ditemukan" API detail.
import { describe, expect, it } from 'vitest';
import {
  isNotFoundMessage,
  programKreatifDetailHref,
  programKreatifListHref,
  programKreatifSearchable,
  toProgramKreatifItem,
} from '@/app/(public)/(pages)/inovasi/program-kreatif-desa/_com/program-kreatif.logic';

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const api = {
  id: 'pk1',
  name: ' Tes Kompetensi ',
  slug: ' Program pemetaan minat warga ',
  deskripsi: '<p>Isi</p>',
  icon: 'layananPublik',
  createdAt: '2026-01-20T03:00:00.000Z',
};

describe('toProgramKreatifItem', () => {
  it('judul & deskripsi singkat dirapikan, ikon, tautan detail', () => {
    expect(toProgramKreatifItem(api)).toEqual({
      id: 'pk1',
      title: 'Tes Kompetensi',
      summary: 'Program pemetaan minat warga',
      icon: 'layananPublik',
      href: '/inovasi/program-kreatif-desa/pk1',
    });
  });

  it('ikon / deskripsi singkat kosong → tanpa ikon, ringkasan kosong', () => {
    const item = toProgramKreatifItem({ ...api, icon: '  ', slug: null });
    expect(item.icon).toBeUndefined();
    expect(item.summary).toBe('');
  });
});

describe('URL', () => {
  it('detail meng-encode id; daftar menulis search/page hanya bila perlu', () => {
    expect(programKreatifDetailHref('a b')).toBe('/inovasi/program-kreatif-desa/a%20b');
    expect(programKreatifListHref()).toBe('/inovasi/program-kreatif-desa');
    expect(programKreatifListHref({ search: 'eco', page: 3 })).toBe('/inovasi/program-kreatif-desa?search=eco&page=3');
  });
});

describe('programKreatifSearchable', () => {
  it('kolom cari hanya bila > ambang atau sedang mencari', () => {
    expect(programKreatifSearchable('', 6, 6)).toBe(false);
    expect(programKreatifSearchable('', 7, 6)).toBe(true);
    expect(programKreatifSearchable('eco', 0, 6)).toBe(true);
    expect(programKreatifSearchable('', null, 6)).toBe(false);
    expect(programKreatifSearchable('eco', null, 6)).toBe(true);
  });
});

describe('isNotFoundMessage', () => {
  it('pesan "tidak ditemukan" (API 200 + success:false) → true; galat lain → false', () => {
    expect(isNotFoundMessage('Program kreatif tidak ditemukan')).toBe(true);
    expect(isNotFoundMessage('Gagal mengambil data program kreatif')).toBe(false);
    expect(isNotFoundMessage(undefined)).toBe(false);
  });
});
