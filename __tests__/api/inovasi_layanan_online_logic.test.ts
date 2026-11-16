// @vitest-environment node
// Layanan Online Desa: hub (?layanan=pengaduan), formulir Administrasi Online (saring/validasi/body/sumber),
// dan pengalihan detail lama Informasi Desa ke URL detail kanonik Berita/Pengumuman.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const jenisGet = vi.fn();
const createPost = vi.fn();
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      inovasi: {
        layananonlinedesa: {
          administrasionline: { create: { post: createPost }, jenislayanan: { 'find-many': { get: jenisGet } } },
        },
      },
    },
  },
}));

const { isPengaduanRequested } = await import('@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/layanan-online.logic');
const { PENGADUAN_HUB_HREF } = await import('@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/layanan-online.meta');
const logic = await import('@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/administrasi.logic');
const { ADMINISTRASI_TEXT } = await import('@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/administrasi.text');
const { loadJenisLayanan, submitAdministrasi } = await import(
  '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/administrasi/administrasi.source'
);
const { informasiRedirectHref, informasiListHref } = await import(
  '@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/informasi/informasi-redirect.logic'
);
const { lookupInformasi } = await import('@/app/(public)/(pages)/inovasi/layanan-online-desa/_com/informasi/informasi-redirect.source');

// test-only
const VALID = { name: 'Ni Made Ayu', alamat: 'Br. Gede', nomorTelepon: '081234567890', jenisLayananId: 'j1' };
const E = ADMINISTRASI_TEXT.errors;

beforeEach(() => {
  jenisGet.mockReset();
  createPost.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('hub Layanan Online', () => {
  it('?layanan=pengaduan membuka modal pengaduan; nilai lain tidak', () => {
    expect(isPengaduanRequested('pengaduan')).toBe(true);
    expect(isPengaduanRequested(' pengaduan ')).toBe(true);
    expect(isPengaduanRequested('administrasi')).toBe(false);
    expect(isPengaduanRequested(null)).toBe(false);
  });

  it('route lama pengaduan dialihkan ke hub dengan parameter itu', () => {
    expect(PENGADUAN_HUB_HREF).toBe('/inovasi/layanan-online-desa?layanan=pengaduan');
  });
});

describe('normalizeAdministrasiField', () => {
  it('nama membuang angka, telepon hanya digit maksimal 13, alamat apa adanya', () => {
    expect(logic.normalizeAdministrasiField('name', 'Made 123 Ayu')).toBe('Made  Ayu');
    expect(logic.normalizeAdministrasiField('nomorTelepon', '+62 812-3456-7890-999')).toBe('6281234567890');
    expect(logic.normalizeAdministrasiField('alamat', 'Jl. Raya No. 5')).toBe('Jl. Raya No. 5');
  });
});

describe('validateAdministrasi', () => {
  it('isian lengkap → tanpa galat', () => {
    expect(logic.validateAdministrasi(VALID)).toEqual({});
    expect(logic.hasAdministrasiErrors({})).toBe(false);
  });

  it('formulir kosong → keempat galat', () => {
    expect(logic.validateAdministrasi(logic.EMPTY_ADMINISTRASI)).toEqual({
      name: E.name,
      alamat: E.alamat,
      nomorTelepon: E.nomorTelepon,
      jenisLayananId: E.jenisLayananId,
    });
  });

  it('batas: nama/alamat minimal 3 setelah trim, telepon 10 sampai 13 digit', () => {
    const errors = logic.validateAdministrasi({ ...VALID, name: '  ab ', alamat: 'abc', nomorTelepon: '081234567' });
    expect(errors).toEqual({ name: E.name, nomorTelepon: E.nomorTelepon });
    expect(logic.validateAdministrasi({ ...VALID, nomorTelepon: '0812345678' })).toEqual({});
    expect(logic.validateAdministrasi({ ...VALID, nomorTelepon: '08123456789012' }).nomorTelepon).toBe(E.nomorTelepon);
  });

  it('isian salah pertama mengikuti urutan formulir (target fokus), bukan urutan kunci objek galat', () => {
    expect(logic.ADMINISTRASI_FIELDS).toEqual(Object.keys(logic.EMPTY_ADMINISTRASI));
    expect(logic.firstInvalidAdministrasiField(logic.validateAdministrasi(logic.EMPTY_ADMINISTRASI))).toBe('name');
    expect(logic.firstInvalidAdministrasiField({ jenisLayananId: 'x', nomorTelepon: 'y' })).toBe('nomorTelepon');
    expect(logic.firstInvalidAdministrasiField(logic.validateAdministrasi({ ...VALID, jenisLayananId: '' }))).toBe('jenisLayananId');
    expect(logic.firstInvalidAdministrasiField({})).toBeUndefined();
  });
});

describe('toAdministrasiPayload & toJenisLayananList', () => {
  it('body kirim dirapikan', () => {
    expect(
      logic.toAdministrasiPayload({ name: '  Ni  Made ', alamat: ' Br. Gede ', nomorTelepon: '0812 3456 7890', jenisLayananId: ' j1 ' }),
    ).toEqual({ name: 'Ni Made', alamat: 'Br. Gede', nomorTelepon: '081234567890', jenisLayananId: 'j1' });
  });

  it('keterangan jenis: HTML editor jadi teks polos, keterangan yang mengulang nama dikosongkan', () => {
    expect(logic.jenisDeskripsi('Keamanan', '<p><strong>Lapor kejadian &amp; ketertiban.</strong></p>')).toBe('Lapor kejadian & ketertiban.');
    expect(logic.jenisDeskripsi('Surat Keterangan Usaha', 'Administrasi Online Surat Keterangan Usaha')).toBe('');
    expect(logic.jenisDeskripsi('SKU', null)).toBe('');
  });

  it('jenis layanan diurut abjad, tanpa nama dibuang, deskripsi null → kosong', () => {
    const list = logic.toJenisLayananList([
      { id: 'b', nama: 'Surat Keterangan Usaha', deskripsi: ' Untuk usaha ' },
      { id: 'x', nama: '  ', deskripsi: 'tanpa nama' },
      { id: 'a', nama: 'Perizinan Berusaha OSS', deskripsi: null },
    ]);
    expect(list).toEqual([
      { id: 'a', nama: 'Perizinan Berusaha OSS', deskripsi: '' },
      { id: 'b', nama: 'Surat Keterangan Usaha', deskripsi: 'Untuk usaha' },
    ]);
  });
});

describe('administrasi.source', () => {
  it('loadJenisLayanan memuat sekali dengan limit 100', async () => {
    jenisGet.mockResolvedValue({ status: 200, data: { success: true, data: [{ id: 'a', nama: 'SKU', deskripsi: 'd' }] } });
    await expect(loadJenisLayanan()).resolves.toEqual([{ id: 'a', nama: 'SKU', deskripsi: 'd' }]);
    expect(jenisGet).toHaveBeenCalledWith({ query: { page: 1, limit: 100 } });
  });

  it('loadJenisLayanan gagal → Error berkonteks', async () => {
    jenisGet.mockResolvedValue({ status: 500, data: null });
    await expect(loadJenisLayanan()).rejects.toThrow('find-many jenis layanan gagal (HTTP 500)');
  });

  it('submitAdministrasi mengirim body; sukses tidak melempar', async () => {
    createPost.mockResolvedValue({ status: 200, data: { success: true } });
    await expect(submitAdministrasi(VALID)).resolves.toBeUndefined();
    expect(createPost).toHaveBeenCalledWith(VALID);
  });

  it('submitAdministrasi gagal → Error berkonteks tanpa isi formulir', async () => {
    createPost.mockResolvedValue({ status: 500, data: null });
    const error = await submitAdministrasi(VALID).catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('kirim administrasi online gagal (HTTP 500): respons tidak valid');
    expect((error as Error).message).not.toContain(VALID.nomorTelepon);
  });
});

describe('pengalihan detail Informasi Desa', () => {
  it('ditemukan → URL kanonik berkategori (di-encode)', () => {
    expect(informasiRedirectHref('berita', 'b1', { status: 'found', kategori: 'Sosial Budaya' })).toBe(
      '/pemerintahan/berita/Sosial%20Budaya/b1',
    );
    expect(informasiRedirectHref('pengumuman', 'p1', { status: 'found', kategori: 'Umum' })).toBe('/pemerintahan/pengumuman/Umum/p1');
  });

  it('tidak ditemukan → daftar; gagal diperiksa → detail dengan kategori pengganti', () => {
    expect(informasiRedirectHref('berita', 'b1', { status: 'missing' })).toBe('/pemerintahan/berita/semua');
    expect(informasiRedirectHref('pengumuman', 'p1', { status: 'missing' })).toBe('/pemerintahan/pengumuman');
    expect(informasiRedirectHref('berita', 'b1', { status: 'error' })).toBe('/pemerintahan/berita/umum/b1');
    expect(informasiListHref('berita')).toBe('/pemerintahan/berita/semua');
  });

  it('lookup berita: 200 → kategori, 404 → missing, 500 → Error', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: { kategoriBerita: { name: 'Sosial' } } }), { status: 200 }),
    );
    await expect(lookupInformasi('berita', 'b1')).resolves.toEqual({ status: 'found', kategori: 'Sosial' });
    expect(fetchMock).toHaveBeenCalledWith('/api/desa/berita/b1');
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 404 }));
    await expect(lookupInformasi('berita', 'x')).resolves.toEqual({ status: 'missing' });
    fetchMock.mockResolvedValueOnce(new Response('', { status: 500 }));
    await expect(lookupInformasi('berita', 'y')).rejects.toThrow('detail berita y gagal (HTTP 500)');
  });

  it('lookup pengumuman memakai sumber detail Pengumuman (status 404 di body → missing)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, data: { id: 'p1', CategoryPengumuman: { name: 'Umum' } } }), { status: 200 }),
    );
    await expect(lookupInformasi('pengumuman', 'p1')).resolves.toEqual({ status: 'found', kategori: 'Umum' });
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ status: 404 }), { status: 200 }));
    await expect(lookupInformasi('pengumuman', 'p2')).resolves.toEqual({ status: 'missing' });
  });
});
