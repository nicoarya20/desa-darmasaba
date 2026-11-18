// @vitest-environment node
// Produk Hukum (Pemerintahan): state admin (Valtio). Daftar memetakan filter ke query API; create/edit memvalidasi di
// klien, mengunggah PDF hanya bila dipilih (tanpa unggah bila validasi/unggah gagal), melaporkan hasil dengan benar,
// dan mengisi/mereset form IN-PLACE (identitas proxy stabil untuk useSnapshot sync).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, api, uploadPdfFile } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  api: { findMany: vi.fn(), create: vi.fn(), updt: vi.fn(), del: vi.fn(), get: vi.fn() },
  uploadPdfFile: vi.fn(),
}));
vi.mock('react-toastify', () => ({ toast }));
vi.mock('@/app/admin/_com/upload/pdf-upload', () => ({ uploadPdfFile, PDF_MAX_SIZE_MB: 20 }));
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      desa: {
        produkhukum: Object.assign(({ id }: { id: string }) => ({ get: () => api.get(id) }), {
          'find-many': { get: api.findMany },
          create: { post: api.create },
          updt: ({ id }: { id: string }) => ({ put: (body: unknown) => api.updt(id, body) }),
          del: ({ id }: { id: string }) => ({ delete: () => api.del(id) }),
        }),
      },
    },
  },
}));

import state, { type ProdukHukumItem } from '@/app/admin/(dashboard)/_state/desa/produkHukum';

// test-only: berkas dan baris rekaan.
const pdf = (name: string) => new File(['x'], name, { type: 'application/pdf' });
const FILE = { id: 'f-1', link: '/api/fileStorage/findUnique/a.pdf', realName: 'a.pdf' };
const ROW: ProdukHukumItem = { id: 'ph-1', judul: 'Perdes 9', nomor: 'Nomor 9', tahun: 2021, kategori: 'PERDES', file: FILE };
const ok = { status: 200, error: null };
const fail = (message: string) => ({ status: 400, error: { value: { message } } });

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  state.create.reset();
  state.edit.id = '';
  state.edit.currentFile = null;
  Object.assign(state.edit.form, { judul: '', nomor: '', tahun: null, kategori: 'PERDES', fileId: undefined });
});

describe('findMany.load', () => {
  it('mengirim page/limit dan menambah q + kategori hanya bila terisi', async () => {
    api.findMany.mockResolvedValue({ status: 200, data: { success: true, data: [ROW], totalPages: 3 } });
    await state.findMany.load(2, 'apbdes', 'PERDES');
    expect(api.findMany).toHaveBeenCalledWith({ query: { page: 2, limit: 10, q: 'apbdes', kategori: 'PERDES' } });
    expect(state.findMany.data).toEqual([ROW]);
    expect([state.findMany.page, state.findMany.totalPages, state.findMany.loading]).toEqual([2, 3, false]);

    await state.findMany.load(1);
    expect(api.findMany).toHaveBeenLastCalledWith({ query: { page: 1, limit: 10 } });
  });

  it('gagal: daftar dikosongkan, toast berpesan, loading kembali false', async () => {
    api.findMany.mockResolvedValue({ status: 500, data: { success: false }, error: { value: { message: 'db down' } } });
    state.findMany.data = [ROW];
    await state.findMany.load(1);
    expect(state.findMany.data).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('db down');
    expect(state.findMany.loading).toBe(false);
  });

  it('jaringan putus: galat dicatat berkonteks dan toast generik tampil', async () => {
    api.findMany.mockRejectedValue(new Error('offline'));
    await state.findMany.load(1);
    expect(console.error).toHaveBeenCalledWith('Gagal memuat produk hukum:', 'offline');
    expect(toast.error).toHaveBeenCalledWith('Terjadi kesalahan saat mengambil daftar produk hukum');
    expect(state.findMany.loading).toBe(false);
  });
});

describe('create.submit', () => {
  it('judul kosong ditolak di klien: toast, tanpa unggah dan tanpa panggilan API', async () => {
    expect(await state.create.submit(pdf('a.pdf'))).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Judul wajib diisi');
    expect(uploadPdfFile).not.toHaveBeenCalled();
    expect(api.create).not.toHaveBeenCalled();
    expect(state.create.loading).toBe(false);
  });

  it('tanpa PDF: fileId tidak ikut terkirim, nomor kosong ikut sebagai teks kosong', async () => {
    api.create.mockResolvedValue(ok);
    Object.assign(state.create.form, { judul: 'SK Baru', kategori: 'SK_PERBEKEL', tahun: 2022 });
    expect(await state.create.submit(null)).toBe(true);
    expect(uploadPdfFile).not.toHaveBeenCalled();
    expect(api.create).toHaveBeenCalledWith({ judul: 'SK Baru', nomor: '', tahun: 2022, kategori: 'SK_PERBEKEL', fileId: undefined });
    expect(toast.success).toHaveBeenCalledWith('Produk hukum berhasil disimpan');
  });

  it('dengan PDF: unggah dulu, lalu simpan membawa fileId hasil unggah', async () => {
    uploadPdfFile.mockResolvedValue('file-baru');
    api.create.mockResolvedValue(ok);
    state.create.form.judul = 'Perdes 1';
    expect(await state.create.submit(pdf('perdes.pdf'))).toBe(true);
    expect(uploadPdfFile.mock.invocationCallOrder[0]).toBeLessThan(api.create.mock.invocationCallOrder[0]);
    expect(api.create.mock.calls[0][0].fileId).toBe('file-baru');
  });

  it('unggah gagal: tidak menyimpan entri, melapor false', async () => {
    uploadPdfFile.mockResolvedValue(null);
    state.create.form.judul = 'Perdes 1';
    expect(await state.create.submit(pdf('perdes.pdf'))).toBe(false);
    expect(api.create).not.toHaveBeenCalled();
    expect(state.create.loading).toBe(false);
  });

  it('API menolak: pesan server ditampilkan dan hasil false; jaringan putus dicatat', async () => {
    state.create.form.judul = 'Perdes 1';
    api.create.mockResolvedValueOnce(fail('Kategori tidak valid'));
    expect(await state.create.submit(null)).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Kategori tidak valid');
    expect(toast.success).not.toHaveBeenCalled();

    api.create.mockRejectedValueOnce(new Error('offline'));
    expect(await state.create.submit(null)).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Gagal menyimpan produk hukum:', 'offline');
    expect(state.create.loading).toBe(false);
  });

  it('reset mengosongkan form di tempat: identitas proxy sama, nilai kembali bawaan', () => {
    const before = state.create.form;
    Object.assign(before, { judul: 'X', nomor: 'Y', tahun: 2000, kategori: 'LAINNYA', fileId: 'f' });
    state.create.reset();
    expect(state.create.form).toBe(before);
    expect(before).toEqual({ judul: '', nomor: '', tahun: null, kategori: 'PERDES', fileId: undefined });
  });
});

describe('edit', () => {
  it('load mengisi form di tempat (nomor null → teks kosong, fileId tak diubah) dan menyimpan berkas saat ini', async () => {
    api.get.mockResolvedValue({ status: 200, data: { success: true, data: { ...ROW, nomor: null } } });
    const before = state.edit.form;
    expect(await state.edit.load('ph-1')).toBe(true);
    expect(api.get).toHaveBeenCalledWith('ph-1');
    expect(state.edit.form).toBe(before);
    expect(before).toEqual({ judul: 'Perdes 9', nomor: '', tahun: 2021, kategori: 'PERDES', fileId: undefined });
    expect(state.edit.id).toBe('ph-1');
    expect(state.edit.currentFile).toEqual(FILE);
  });

  it('load id tidak ada → false dan toast', async () => {
    api.get.mockResolvedValue({ status: 404, data: { success: false }, error: { value: { message: 'Produk hukum tidak ditemukan' } } });
    expect(await state.edit.load('x')).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Produk hukum tidak ditemukan');
    expect(state.edit.loading).toBe(false);
  });

  it('submit tanpa PDF baru: fileId tidak terkirim (berkas lama dipertahankan); dengan PDF: id baru', async () => {
    api.updt.mockResolvedValue(ok);
    state.edit.id = 'ph-1';
    Object.assign(state.edit.form, { judul: 'Judul Baru', tahun: 2023, kategori: 'LAINNYA' });
    expect(await state.edit.submit(null)).toBe(true);
    expect(api.updt).toHaveBeenCalledWith('ph-1', { judul: 'Judul Baru', nomor: '', tahun: 2023, kategori: 'LAINNYA', fileId: undefined });
    expect(uploadPdfFile).not.toHaveBeenCalled();

    uploadPdfFile.mockResolvedValue('file-2');
    expect(await state.edit.submit(pdf('baru.pdf'))).toBe(true);
    expect(api.updt.mock.calls[1][1].fileId).toBe('file-2');
  });

  it('submit invalid atau ditolak server → false tanpa toast sukses', async () => {
    state.edit.id = 'ph-1';
    state.edit.form.judul = '';
    expect(await state.edit.submit(null)).toBe(false);
    expect(api.updt).not.toHaveBeenCalled();

    state.edit.form.judul = 'Judul';
    api.updt.mockResolvedValue(fail('Produk hukum tidak ditemukan'));
    expect(await state.edit.submit(null)).toBe(false);
    expect(toast.error).toHaveBeenLastCalledWith('Produk hukum tidak ditemukan');
    expect(toast.success).not.toHaveBeenCalled();
  });
});

describe('delete.byId', () => {
  it('sukses → true + toast; gagal → false + pesan server; jaringan putus → false dan dicatat', async () => {
    api.del.mockResolvedValueOnce(ok);
    expect(await state.delete.byId('ph-1')).toBe(true);
    expect(api.del).toHaveBeenCalledWith('ph-1');
    expect(toast.success).toHaveBeenCalledWith('Produk hukum berhasil dihapus');

    api.del.mockResolvedValueOnce(fail('Hanya admin yang boleh mengelola produk hukum'));
    expect(await state.delete.byId('ph-1')).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Hanya admin yang boleh mengelola produk hukum');

    api.del.mockRejectedValueOnce(new Error('offline'));
    expect(await state.delete.byId('ph-1')).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Gagal menghapus produk hukum ph-1:', 'offline');
    expect(state.delete.loading).toBe(false);
  });
});
