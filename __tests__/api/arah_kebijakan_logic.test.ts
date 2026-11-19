// @vitest-environment node
// Halaman Arah Kebijakan Pembangunan Desa: aturan tab (Berita Acara bersyarat), urutan tahun menurun, penomoran,
// dan sumber data (query find-many per kategori, galat berkonteks). ApiFetch di-mock.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { desa: { dokumenperencanaan: { 'find-many': { get: findMany } } } } },
}));

import {
  ARAH_PAGE_SIZE,
  KATEGORI_TETAP,
  kategoriTampil,
  musyawarahDokumen,
  nomorBaris,
  urutkanTahunMenurun,
  type ArahDokumen,
} from '@/app/(public)/(pages)/pemerintahan/arah-kebijakan-pembangunan-desa/_com/arah-kebijakan.logic';
import {
  loadAdaBeritaAcara,
  loadDokumenKategori,
} from '@/app/(public)/(pages)/pemerintahan/arah-kebijakan-pembangunan-desa/_com/arah-kebijakan.source';

const dok = (id: string, extra: Partial<ArahDokumen> = {}): ArahDokumen => ({
  id, jenis: 'RKP', judul: `Dokumen ${id}`, tahun: 2026, tahunMulai: null, tahunSelesai: null, // test-only
  nomorPerdes: null, ringkasan: null, jenisMusyawarah: null, file: null, ...extra,
});
const ids = (items: ArahDokumen[]) => items.map((d) => d.id);

beforeEach(() => vi.resetAllMocks());

describe('kategoriTampil', () => {
  it('empat kategori tetap berurutan RPJM, RKP, APBDes, Pelaporan', () => {
    expect(KATEGORI_TETAP).toEqual(['RPJM', 'RKP', 'APBDES', 'PELAPORAN_APBDES']);
    expect(kategoriTampil(false)).toEqual(['RPJM', 'RKP', 'APBDES', 'PELAPORAN_APBDES']);
  });

  it('Berita Acara ditambahkan di akhir hanya bila sudah ada dokumennya', () => {
    expect(kategoriTampil(true)).toEqual(['RPJM', 'RKP', 'APBDES', 'PELAPORAN_APBDES', 'BERITA_ACARA_MUSYAWARAH']);
  });
});

describe('urutkanTahunMenurun', () => {
  it('tahun terbaru dulu; tanpa tahun di akhir; tahun sama mengikuti urutan API', () => {
    const sorted = urutkanTahunMenurun([
      dok('a', { tahun: 2024 }),
      dok('b', { tahun: null }),
      dok('c', { tahun: 2026 }),
      dok('d', { tahun: 2024 }),
      dok('e', { tahun: 2025 }),
    ]);
    expect(ids(sorted)).toEqual(['c', 'e', 'a', 'd', 'b']);
  });

  it('RPJM diurut menurut tahun mulai, bukan tahun selesai', () => {
    const sorted = urutkanTahunMenurun([
      dok('lama', { jenis: 'RPJM', tahun: null, tahunMulai: 2016, tahunSelesai: 2028 }),
      dok('baru', { jenis: 'RPJM', tahun: null, tahunMulai: 2021, tahunSelesai: 2027 }),
    ]);
    expect(ids(sorted)).toEqual(['baru', 'lama']);
  });

  it('tidak mengubah array masukan', () => {
    const input = [dok('a', { tahun: 2020 }), dok('b', { tahun: 2026 })];
    urutkanTahunMenurun(input);
    expect(ids(input)).toEqual(['a', 'b']);
  });
});

describe('nomorBaris & musyawarahDokumen', () => {
  it('penomoran berlanjut antarhalaman', () => {
    expect(nomorBaris(1, 0)).toBe(1);
    expect(nomorBaris(1, ARAH_PAGE_SIZE - 1)).toBe(ARAH_PAGE_SIZE);
    expect(nomorBaris(3, 0)).toBe(2 * ARAH_PAGE_SIZE + 1);
  });

  it('jenis musyawarah dikenal jadi label, tidak dikenal atau kosong jadi null', () => {
    expect(musyawarahDokumen(dok('x', { jenisMusyawarah: 'MUSRENBANGDES' }))).toBe('Musrenbang Desa');
    expect(musyawarahDokumen(dok('x', { jenisMusyawarah: 'RAPAT' }))).toBeNull();
    expect(musyawarahDokumen(dok('x'))).toBeNull();
  });
});

describe('loadDokumenKategori', () => {
  it('meminta jenis, halaman, dan batas halaman ke find-many lalu mengembalikan paginasi API', async () => {
    findMany.mockResolvedValue({ status: 200, data: { success: true, data: [dok('a')], totalPages: 3, total: 25 } });
    const res = await loadDokumenKategori('APBDES', 2);
    expect(findMany).toHaveBeenCalledWith({ query: { jenis: 'APBDES', page: 2, limit: ARAH_PAGE_SIZE } });
    expect(res).toEqual({ items: [dok('a')], totalPages: 3, total: 25 });
  });

  it('respons gagal dilempar sebagai Error yang menyebut kategori dan status', async () => {
    findMany.mockResolvedValue({ status: 500, data: { success: false, message: 'Gagal mengambil dokumen perencanaan' } });
    await expect(loadDokumenKategori('RPJM', 1)).rejects.toThrow(/RPJM.*500.*Gagal mengambil/);
  });
});

describe('loadAdaBeritaAcara', () => {
  it('true bila total berita acara aktif > 0 (cukup satu baris diminta)', async () => {
    findMany.mockResolvedValue({ status: 200, data: { success: true, data: [dok('b', { jenis: 'BERITA_ACARA_MUSYAWARAH' })], total: 4, totalPages: 4 } });
    expect(await loadAdaBeritaAcara()).toBe(true);
    expect(findMany).toHaveBeenCalledWith({ query: { jenis: 'BERITA_ACARA_MUSYAWARAH', page: 1, limit: 1 } });
  });

  it('false bila belum ada satu pun', async () => {
    findMany.mockResolvedValue({ status: 200, data: { success: true, data: [], total: 0, totalPages: 0 } });
    expect(await loadAdaBeritaAcara()).toBe(false);
  });

  it('galat dilempar (pemanggil menyembunyikan tab, bukan menganggap ada)', async () => {
    findMany.mockResolvedValue({ status: 503, data: null });
    await expect(loadAdaBeritaAcara()).rejects.toThrow(/503/);
  });
});
