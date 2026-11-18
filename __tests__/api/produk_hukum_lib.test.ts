// @vitest-environment node
// Produk Hukum (Pemerintahan): aturan murni kategori, label, dan validasi input create/update.
import { describe, expect, it } from 'vitest';
import {
  JUDUL_PRODUK_HUKUM_MAX,
  KATEGORI_PRODUK_HUKUM,
  KATEGORI_PRODUK_HUKUM_LABEL,
  NOMOR_PRODUK_HUKUM_MAX,
  PESAN_PRODUK_HUKUM,
  TAHUN_PRODUK_HUKUM_MAX,
  TAHUN_PRODUK_HUKUM_MIN,
  isKategoriProdukHukum,
  labelKategoriProdukHukum,
  parseProdukHukumInput,
} from '@/lib/produk-hukum';

// test-only: body rekaan.
const valid = { judul: 'Perdes Nomor 9 Tahun 2021', kategori: 'PERDES' };

describe('kategori & label', () => {
  it('empat kategori sah, tiap kategori punya label', () => {
    expect(KATEGORI_PRODUK_HUKUM).toEqual(['PERDES', 'PERATURAN_PERBEKEL', 'SK_PERBEKEL', 'LAINNYA']);
    for (const kategori of KATEGORI_PRODUK_HUKUM) {
      expect(isKategoriProdukHukum(kategori)).toBe(true);
      expect(KATEGORI_PRODUK_HUKUM_LABEL[kategori]).toBeTruthy();
    }
  });

  it('menolak nilai di luar daftar (termasuk huruf kecil dan bukan teks)', () => {
    for (const nilai of ['perdes', 'SK', '', null, undefined, 1]) expect(isKategoriProdukHukum(nilai)).toBe(false);
  });

  it('label kategori tak dikenal ditampilkan apa adanya', () => {
    expect(labelKategoriProdukHukum('SK_PERBEKEL')).toBe('SK Perbekel');
    expect(labelKategoriProdukHukum('LAMA')).toBe('LAMA');
  });
});

describe('parseProdukHukumInput', () => {
  it('menerima input minimal: nomor/tahun kosong → null, fileId tidak dikirim → undefined', () => {
    expect(parseProdukHukumInput(valid)).toEqual({
      ok: true,
      data: { judul: valid.judul, nomor: null, tahun: null, kategori: 'PERDES', fileId: undefined },
    });
  });

  it('merapikan judul dan nomor (trim + satukan spasi), mengambil tahun dan fileId', () => {
    const hasil = parseProdukHukumInput({
      judul: '  Perdes   APBDes ',
      nomor: ' Nomor  9  Tahun 2021 ',
      tahun: 2021,
      kategori: 'PERATURAN_PERBEKEL',
      fileId: 'file-1',
    });
    expect(hasil).toEqual({
      ok: true,
      data: { judul: 'Perdes APBDes', nomor: 'Nomor 9 Tahun 2021', tahun: 2021, kategori: 'PERATURAN_PERBEKEL', fileId: 'file-1' },
    });
  });

  it('nomor spasi saja → null; fileId null/"" → null (lepas berkas)', () => {
    const spasi = parseProdukHukumInput({ ...valid, nomor: '   ', fileId: null });
    expect(spasi).toMatchObject({ ok: true, data: { nomor: null, fileId: null } });
    expect(parseProdukHukumInput({ ...valid, fileId: '' })).toMatchObject({ ok: true, data: { fileId: null } });
  });

  it.each([
    ['judul kosong', { ...valid, judul: '  ' }, PESAN_PRODUK_HUKUM.judulKosong],
    ['judul bukan teks', { ...valid, judul: 5 }, PESAN_PRODUK_HUKUM.judulKosong],
    ['judul > 255', { ...valid, judul: 'x'.repeat(JUDUL_PRODUK_HUKUM_MAX + 1) }, PESAN_PRODUK_HUKUM.judulPanjang],
    ['judul memuat tag', { ...valid, judul: '<b>Perdes</b>' }, PESAN_PRODUK_HUKUM.judulBukanTeksPolos],
    ['nomor > 100', { ...valid, nomor: 'x'.repeat(NOMOR_PRODUK_HUKUM_MAX + 1) }, PESAN_PRODUK_HUKUM.nomorPanjang],
    ['nomor memuat tag', { ...valid, nomor: '<i>9</i>' }, PESAN_PRODUK_HUKUM.nomorBukanTeksPolos],
    ['nomor bukan teks', { ...valid, nomor: 9 }, PESAN_PRODUK_HUKUM.nomorTipe],
    ['tahun di bawah batas', { ...valid, tahun: TAHUN_PRODUK_HUKUM_MIN - 1 }, PESAN_PRODUK_HUKUM.tahunTidakValid],
    ['tahun di atas batas', { ...valid, tahun: TAHUN_PRODUK_HUKUM_MAX + 1 }, PESAN_PRODUK_HUKUM.tahunTidakValid],
    ['tahun pecahan', { ...valid, tahun: 2020.5 }, PESAN_PRODUK_HUKUM.tahunTidakValid],
    ['tahun teks', { ...valid, tahun: '2020' }, PESAN_PRODUK_HUKUM.tahunTidakValid],
    ['kategori tak sah', { ...valid, kategori: 'UU' }, PESAN_PRODUK_HUKUM.kategoriTidakValid],
    ['kategori hilang', { judul: 'A' }, PESAN_PRODUK_HUKUM.kategoriTidakValid],
    ['fileId bukan teks', { ...valid, fileId: 7 }, PESAN_PRODUK_HUKUM.fileIdTipe],
  ])('menolak %s', (_nama, body, message) => {
    expect(parseProdukHukumInput(body as Record<string, unknown>)).toEqual({ ok: false, message });
  });

  it('batas sah diterima: judul 255, nomor 100, tahun 1900 dan 2100', () => {
    for (const tahun of [TAHUN_PRODUK_HUKUM_MIN, TAHUN_PRODUK_HUKUM_MAX]) {
      expect(parseProdukHukumInput({ ...valid, tahun }).ok).toBe(true);
    }
    const batas = { ...valid, judul: 'x'.repeat(JUDUL_PRODUK_HUKUM_MAX), nomor: 'y'.repeat(NOMOR_PRODUK_HUKUM_MAX) };
    expect(parseProdukHukumInput(batas).ok).toBe(true);
  });
});
