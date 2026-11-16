// @vitest-environment node
// Perpustakaan Digital publik: adapter API → Buku, pembacaan respons detail (tidak ditemukan/nonaktif/galat),
// dan sumber data (katalog sekali muat ≤ batas, detail, kirim peminjaman). ApiFetch di-mock: tidak ada request nyata.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ findMany: vi.fn(), detailGet: vi.fn(), detailArg: vi.fn(), create: vi.fn() }));

// DOMPurify butuh DOM; stub ringan (test-only) supaya cabang sanitasi teruji di node.
vi.mock('dompurify', () => ({
  default: { sanitize: (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/ on\w+="[^"]*"/gi, '') },
}));
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      pendidikan: {
        perpustakaandigital: {
          dataperpustakaan: Object.assign(
            (arg: { id: string }) => {
              h.detailArg(arg);
              return { get: h.detailGet };
            },
            { findMany: { get: h.findMany } },
          ),
          peminjamanbuku: { create: { post: h.create } },
        },
      },
    },
  },
}));

import {
  readBukuDetail,
  toBuku,
  type BukuApiItem,
} from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus-adapter.logic';
import { PERPUS_LIST_LIMIT } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.meta';
import {
  loadBukuDetail,
  loadKatalogBuku,
} from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.source';
import { kirimPeminjaman } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_lib/peminjaman.source';
import type { PeminjamanPayload } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_lib/peminjamanForm';

// test-only: bentuk item API dataperpustakaan.
const api = (over: Partial<BukuApiItem> = {}): BukuApiItem => ({
  id: 'b1',
  judul: ' Dongeng Bali ',
  deskripsi: '<p>Kisah <strong>rakyat</strong>&nbsp;Bali</p><script>alert(1)</script>',
  isActive: true,
  createdAt: '2026-11-03T02:00:00.000Z',
  kategori: { id: 'k1', name: 'Anak Dan Remaja' },
  image: { link: 'https://cdn.example.test/b1.jpg' },
  ...over,
});

// test-only: payload valid.
const PAYLOAD: PeminjamanPayload = {
  bukuId: 'b1',
  nama: 'Budi',
  noTelp: '+6281234567890',
  alamat: 'Banjar Tengah',
  tanggalPinjam: '2026-11-16T04:00:00.000Z',
  batasKembali: '2026-11-20T04:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('toBuku', () => {
  it('judul dipangkas, deskripsi disanitasi + teks polos, slug kategori, sampul, waktu dibuat', () => {
    expect(toBuku(api())).toEqual({
      id: 'b1',
      judul: 'Dongeng Bali',
      deskripsiHtml: '<p>Kisah <strong>rakyat</strong>&nbsp;Bali</p>',
      ringkasan: 'Kisah rakyat Bali alert(1)',
      kategori: { id: 'k1', nama: 'Anak Dan Remaja', slug: 'anak-dan-remaja' },
      sampul: 'https://cdn.example.test/b1.jpg',
      dibuat: Date.parse('2026-11-03T02:00:00.000Z'),
    });
  });

  it('nilai kosong → bawaan aman', () => {
    const b = toBuku(api({ judul: '  ', deskripsi: '<p></p>', kategori: { id: 'k', name: ' ' }, image: null, createdAt: 'x' }));
    expect(b).toMatchObject({ judul: 'Tanpa judul', deskripsiHtml: '', ringkasan: '', kategori: null, sampul: null, dibuat: 0 });
  });
});

describe('readBukuDetail', () => {
  it('sukses → data; nonaktif → null (MITIGASI perpus-detail)', () => {
    expect(readBukuDetail('b1', 200, { success: true, data: api() })?.id).toBe('b1');
    expect(readBukuDetail('b1', 200, { success: true, data: api({ isActive: false }) })).toBeNull();
  });

  it('200 + success:false "Data not found" → null', () => {
    expect(readBukuDetail('zz', 200, { success: false, message: 'Data not found' })).toBeNull();
  });

  it('HTTP gagal atau respons aneh → Error berkonteks id', () => {
    expect(() => readBukuDetail('b1', 500, { message: 'boom' })).toThrow('Detail buku b1 gagal (HTTP 500): boom');
    expect(() => readBukuDetail('b1', 200, { success: false, message: 'DB down' })).toThrow('Detail buku b1 gagal: DB down');
    expect(() => readBukuDetail('b1', 200, null)).toThrow('respons tidak valid');
  });
});

describe('loadKatalogBuku', () => {
  it(`satu permintaan halaman 1, limit ${PERPUS_LIST_LIMIT}; tanpa peringatan bila total muat`, async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    h.findMany.mockResolvedValue({ status: 200, data: { success: true, data: [api()], total: 1 } });
    const items = await loadKatalogBuku();
    expect(h.findMany).toHaveBeenCalledTimes(1);
    expect(h.findMany).toHaveBeenCalledWith({ query: { page: 1, limit: PERPUS_LIST_LIMIT } });
    expect(items.map((b) => b.judul)).toEqual(['Dongeng Bali']);
    expect(warn).not.toHaveBeenCalled();
  });

  it('total server > dimuat → console.warn (batas saring klien)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    h.findMany.mockResolvedValue({ status: 200, data: { success: true, data: [api()], total: 140 } });
    await loadKatalogBuku();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('140 buku, hanya 1 pertama'));
  });

  it('gagal → Error berkonteks', async () => {
    h.findMany.mockResolvedValue({ status: 500, data: null });
    await expect(loadKatalogBuku()).rejects.toThrow('find-many perpustakaan digital gagal (HTTP 500)');
  });
});

describe('loadBukuDetail', () => {
  it('meminta id yang benar dan memetakan ke Buku', async () => {
    h.detailGet.mockResolvedValue({ status: 200, data: { success: true, data: api() }, error: null });
    expect((await loadBukuDetail('b1'))?.kategori?.slug).toBe('anak-dan-remaja');
    expect(h.detailArg).toHaveBeenCalledWith({ id: 'b1' });
  });

  it('tidak ditemukan → null; galat HTTP membaca badan error', async () => {
    h.detailGet.mockResolvedValue({ status: 200, data: { success: false, message: 'Data not found' }, error: null });
    expect(await loadBukuDetail('zz')).toBeNull();
    h.detailGet.mockResolvedValue({ status: 500, data: null, error: { value: { message: 'boom' } } });
    await expect(loadBukuDetail('b1')).rejects.toThrow('(HTTP 500): boom');
  });
});

describe('kirimPeminjaman', () => {
  it('POST payload apa adanya ke peminjamanbuku/create', async () => {
    h.create.mockResolvedValue({ status: 200, data: { success: true }, error: null });
    await kirimPeminjaman(PAYLOAD);
    expect(h.create).toHaveBeenCalledWith(PAYLOAD);
  });

  it('gagal → Error hanya berisi id buku + status, tanpa data pribadi', async () => {
    h.create.mockResolvedValue({ status: 422, data: null, error: { value: { message: 'invalid' } } });
    const err = await kirimPeminjaman(PAYLOAD).catch((e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe('Kirim peminjaman buku b1 gagal (HTTP 422)');
    expect((err as Error).message).not.toMatch(/Budi|\+62|Banjar/);
  });

  it('HTTP 200 tetapi success:false → tetap gagal', async () => {
    h.create.mockResolvedValue({ status: 200, data: { success: false }, error: null });
    await expect(kirimPeminjaman(PAYLOAD)).rejects.toThrow('HTTP 200');
  });
});
