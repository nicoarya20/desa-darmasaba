// @vitest-environment node
// Gambar sisipan di deskripsi Program Inovasi: aturan src (hanya penyimpanan sendiri), sanitasi render server,
// unggah saat Simpan (blob preview → link tersimpan), dan API yang menurunkan relasi `gambarSisipan` dari isi
// deskripsi serta membersihkan berkas yang dihapus dari teks. prisma dan penghapus berkas di-mock.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, removeStoredFileMock } = vi.hoisted(() => ({
  removeStoredFileMock: vi.fn(),
  prismaMock: {
    programInovasi: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    fileStorage: { findMany: vi.fn() },
  },
}));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
vi.mock('@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile', () => ({ default: removeStoredFileMock }));

import {
  kotakIsiTidakTransparan,
  periksaBerkasSisipan,
  periksaJumlahSisipan,
  unggahGambarSisipan,
} from '@/app/admin/(dashboard)/landing-page/profil/program-inovasi/_lib/gambar-sisipan.logic';
import programInovasiCreate from '@/app/api/[[...slugs]]/_lib/landing_page/profile/program-inovasi/create';
import programInovasiDelete from '@/app/api/[[...slugs]]/_lib/landing_page/profile/program-inovasi/del';
import programInovasiUpdate from '@/app/api/[[...slugs]]/_lib/landing_page/profile/program-inovasi/updt';
import {
  gantiSrcGambar,
  isGambarSisipanSrc,
  MAX_GAMBAR_SISIPAN,
  namaGambarSisipan,
  rapikanGambarSisipan,
  srcGambarDalamHtml,
} from '@/lib/gambar-sisipan';
import { sanitizeArticleHtml } from '@/lib/rich-text-server';

// test-only: nama berkas & HTML rekaan.
const SRC = '/api/img/abc_DEF-123-desktop.webp';
const img = (src: string, extra = '') => `<img src="${src}"${extra}>`;
const deskripsi = (...srcs: string[]) => `<p>Pembuka</p>${srcs.map((s) => img(s)).join('<p>Tengah</p>')}<p>Penutup</p>`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (body: unknown = {}): any => ({ params: { id: 'r1' }, body, set: {} });

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('aturan src gambar sisipan', () => {
  it('hanya /api/img/<nama> tanpa host, query, atau path lain', () => {
    expect(isGambarSisipanSrc(SRC)).toBe(true);
    for (const bad of [
      'https://evil.example/a.png', '//evil.example/a.png', '/api/img/../secret', '/api/img/a.png?x=1',
      '/api/fileStorage/findUnique/a.pdf', 'blob:http://localhost/123', 'data:image/png;base64,AAA', 'javascript:alert(1)',
      '', null, undefined,
    ]) {
      expect(isGambarSisipanSrc(bad), String(bad)).toBe(false);
    }
  });

  it('src diambil berurutan tanpa duplikat; nama berkas hanya dari src yang sah', () => {
    const html = deskripsi(SRC, 'https://x.example/a.png', SRC, '/api/img/kedua.webp');
    expect(srcGambarDalamHtml(html)).toEqual([SRC, 'https://x.example/a.png', '/api/img/kedua.webp']);
    expect(namaGambarSisipan(html)).toEqual(['abc_DEF-123-desktop.webp', 'kedua.webp']);
    expect(srcGambarDalamHtml(null)).toEqual([]);
  });

  it('gantiSrcGambar hanya mengganti src yang ada di peta', () => {
    const html = `${img('blob:a', ' alt=""')}${img(SRC)}`;
    expect(gantiSrcGambar(html, new Map([['blob:a', '/api/img/baru.webp']]))).toBe(`${img('/api/img/baru.webp', ' alt=""')}${img(SRC)}`);
  });

  it('rapikanGambarSisipan: gambar luar dibuang, alt kosong diisi (di-escape), lazy-load ditambahkan', () => {
    const html = `<p>a</p><img src="https://x.example/a.png"><img src="${SRC}" alt=""><img src="${SRC}" alt="Maskot">`;
    expect(rapikanGambarSisipan(html, 'Davest "III" & <b>')).toBe(
      `<p>a</p><img src="${SRC}" alt="Davest &quot;III&quot; &amp; &lt;b&gt;" loading="lazy" decoding="async">` +
        `<img src="${SRC}" alt="Maskot" loading="lazy" decoding="async">`,
    );
  });
});

describe('sanitizeArticleHtml (halaman detail, server)', () => {
  it('gambar dari penyimpanan sendiri tetap di posisinya dengan alt bawaan dan lazy-load', () => {
    const html = sanitizeArticleHtml(`<p>Satu</p>${img(SRC, ' alt="" onerror="alert(1)" width="900"')}<p>Dua</p>`, {
      imageAlt: 'Davest',
    });
    expect(html).toBe(`<p>Satu</p><img src="${SRC}" alt="Davest" loading="lazy" decoding="async" /><p>Dua</p>`);
  });

  it('gambar luar, data:, dan javascript: dibuang seluruhnya; tautan tetap dibuka di tab baru', () => {
    const html = sanitizeArticleHtml(
      `<p>Teks <a href="https://desa.example">tautan</a></p>${img('https://evil.example/a.png')}${img('data:image/png;base64,AAA')}${img('javascript:alert(1)')}`,
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('<a href="https://desa.example" target="_blank" rel="noopener noreferrer">tautan</a>');
  });
});

describe('form admin: unggah gambar sisipan saat Simpan', () => {
  it('menolak berkas bukan gambar dan gambar > 5MB', () => {
    expect(periksaBerkasSisipan({ type: 'application/pdf', size: 10 })).toMatch(/harus berupa gambar/);
    expect(periksaBerkasSisipan({ type: 'image/png', size: 5 * 1024 ** 2 + 1 })).toMatch(/5MB/);
    expect(periksaBerkasSisipan({ type: 'image/png', size: 1000 })).toBeNull();
  });

  it(`menolak lebih dari ${MAX_GAMBAR_SISIPAN} gambar`, () => {
    const srcs = Array.from({ length: MAX_GAMBAR_SISIPAN + 1 }, (_, i) => `/api/img/g${i}.webp`);
    expect(periksaJumlahSisipan(deskripsi(...srcs))).toMatch(`Maksimal ${MAX_GAMBAR_SISIPAN}`);
    expect(periksaJumlahSisipan(deskripsi(...srcs.slice(1)))).toBeNull();
  });

  it('hanya preview blob yang diunggah lalu diganti link tersimpan; gambar lama tidak diunggah ulang', async () => {
    const file = new File(['x'], 'maskot.png', { type: 'image/png' });
    const unggah = vi.fn().mockResolvedValue('/api/img/maskot-desktop.webp');
    const hasil = await unggahGambarSisipan(deskripsi('blob:http://localhost/1', SRC), new Map([['blob:http://localhost/1', file]]), unggah);
    expect(unggah).toHaveBeenCalledTimes(1);
    expect(unggah).toHaveBeenCalledWith(file);
    expect(hasil).toBe(deskripsi('/api/img/maskot-desktop.webp', SRC));
  });

  it('unggahan gagal atau berkas preview hilang → galat berkonteks (form tidak tersimpan)', async () => {
    const file = new File(['x'], 'maskot.png', { type: 'image/png' });
    await expect(
      unggahGambarSisipan(deskripsi('blob:1'), new Map([['blob:1', file]]), vi.fn().mockResolvedValue(null)),
    ).rejects.toThrow('Gagal mengunggah gambar sisipan "maskot.png"');
    await expect(unggahGambarSisipan(deskripsi('blob:2'), new Map(), vi.fn())).rejects.toThrow(/tidak ditemukan/);
  });
});

// test-only: gambar RGBA rekaan; `isi` = kotak piksel tidak transparan (alpha 255), sisanya alpha 0.
const rgba = (lebar: number, tinggi: number, isi?: { x: number; y: number; w: number; h: number }) => {
  const data = new Uint8ClampedArray(lebar * tinggi * 4);
  if (isi) {
    for (let y = isi.y; y < isi.y + isi.h; y++) for (let x = isi.x; x < isi.x + isi.w; x++) data[(y * lebar + x) * 4 + 3] = 255;
  }
  return data;
};

describe('kotakIsiTidakTransparan (potong tepi transparan gambar sisipan)', () => {
  it('maskot kecil di kanvas lebar → kotak isi persis (dipakai untuk memotong)', () => {
    const isi = { x: 30, y: 10, w: 40, h: 50 };
    expect(kotakIsiTidakTransparan(rgba(100, 80, isi), 100, 80)).toEqual(isi);
  });

  it('gambar penuh, tepi transparan sangat tipis, atau kosong total → null (berkas asli dipakai)', () => {
    expect(kotakIsiTidakTransparan(rgba(100, 100, { x: 0, y: 0, w: 100, h: 100 }), 100, 100)).toBeNull();
    expect(kotakIsiTidakTransparan(rgba(100, 100, { x: 1, y: 0, w: 99, h: 100 }), 100, 100)).toBeNull();
    expect(kotakIsiTidakTransparan(rgba(100, 100), 100, 100)).toBeNull();
  });

  it('piksel nyaris transparan (sisa antialias, alpha ≤ 8) tidak memperlebar kotak', () => {
    const data = rgba(100, 100, { x: 40, y: 40, w: 20, h: 20 });
    data[(0 * 100 + 0) * 4 + 3] = 8;
    expect(kotakIsiTidakTransparan(data, 100, 100)).toEqual({ x: 40, y: 40, w: 20, h: 20 });
  });
});

describe('API Program Inovasi: relasi gambarSisipan dari deskripsi', () => {
  it('create: gambar sisipan yang terdaftar di-connect (dicari lewat nama berkas)', async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([{ id: 'f1' }]);
    prismaMock.programInovasi.create.mockResolvedValue({ id: 'r1' });
    const res = await programInovasiCreate(ctx({ name: 'Davest', description: deskripsi(SRC, 'https://x.example/a.png') }));
    expect(res).toMatchObject({ success: true });
    expect(prismaMock.fileStorage.findMany).toHaveBeenCalledWith({
      where: { name: { in: ['abc_DEF-123-desktop.webp'] }, category: 'image' },
      select: { id: true },
    });
    expect(prismaMock.programInovasi.create.mock.calls[0][0].data.gambarSisipan).toEqual({ connect: [{ id: 'f1' }] });
  });

  it(`create: lebih dari ${MAX_GAMBAR_SISIPAN} gambar → 400, tidak menulis`, async () => {
    const srcs = Array.from({ length: MAX_GAMBAR_SISIPAN + 1 }, (_, i) => `/api/img/g${i}.webp`);
    const c = ctx({ name: 'Davest', description: deskripsi(...srcs) });
    expect(await programInovasiCreate(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(prismaMock.programInovasi.create).not.toHaveBeenCalled();
  });

  it('update: relasi di-set ulang dari deskripsi; gambar yang dihapus dari teks dibersihkan setelah update', async () => {
    prismaMock.fileStorage.findMany.mockResolvedValue([{ id: 'f2' }]);
    prismaMock.programInovasi.findUnique.mockResolvedValue({ imageId: null, images: [], gambarSisipan: [{ id: 'f1' }, { id: 'f2' }] });
    prismaMock.programInovasi.update.mockResolvedValue({ id: 'r1', imageId: null, images: [], gambarSisipan: [{ id: 'f2' }] });
    expect(await programInovasiUpdate(ctx({ description: deskripsi('/api/img/f2.webp') }))).toMatchObject({ success: true });
    expect(prismaMock.programInovasi.update.mock.calls[0][0].data.gambarSisipan).toEqual({ set: [{ id: 'f2' }] });
    expect(removeStoredFileMock.mock.calls).toEqual([[{ id: 'f1' }, 'ProgramInovasi']]);
    expect(removeStoredFileMock.mock.invocationCallOrder[0]).toBeGreaterThan(prismaMock.programInovasi.update.mock.invocationCallOrder[0]);
  });

  it('update tanpa deskripsi: relasi gambar sisipan tidak diubah dan tidak dibersihkan', async () => {
    prismaMock.programInovasi.findUnique.mockResolvedValue({ imageId: null, images: [], gambarSisipan: [{ id: 'f1' }] });
    prismaMock.programInovasi.update.mockResolvedValue({ id: 'r1', imageId: null, images: [], gambarSisipan: [{ id: 'f1' }] });
    await programInovasiUpdate(ctx({ urutan: 2 }));
    expect(prismaMock.fileStorage.findMany).not.toHaveBeenCalled();
    expect(prismaMock.programInovasi.update.mock.calls[0][0].data).not.toHaveProperty('gambarSisipan');
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it('delete: gambar sisipan ikut dibersihkan bersama logo dan galeri', async () => {
    prismaMock.programInovasi.findUnique.mockResolvedValue({ images: [{ id: 'g1' }], gambarSisipan: [{ id: 'f1' }] });
    prismaMock.programInovasi.delete.mockResolvedValue({ id: 'r1', imageId: 'logo' });
    await programInovasiDelete(ctx());
    expect(removeStoredFileMock.mock.calls.map((call) => call[0].id)).toEqual(['logo', 'g1', 'f1']);
  });
});
