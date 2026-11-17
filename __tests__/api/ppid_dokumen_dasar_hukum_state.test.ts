// @vitest-environment node
// Lomba 2.5: state admin dokumen Dasar Hukum (Valtio). Simpan banyak PDF berurutan dengan kegagalan terisolasi per
// berkas (satu gagal tidak membatalkan yang lain, percobaan ulang tidak mengunggah dobel), plus ubah judul, geser
// urutan, dan hapus yang melapor sukses/gagal dengan benar.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, api, uploadPdfFile } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  api: { findMany: vi.fn(), create: vi.fn(), updt: vi.fn(), reorder: vi.fn(), del: vi.fn() },
  uploadPdfFile: vi.fn(),
}));
vi.mock('react-toastify', () => ({ toast }));
vi.mock('@/app/admin/_com/upload/pdf-upload', () => ({ uploadPdfFile, PDF_MAX_SIZE_MB: 20 }));
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      ppid: {
        dasarhukumppid: {
          dokumen: {
            'find-many': { get: api.findMany },
            create: { post: api.create },
            updt: ({ id }: { id: string }) => ({ put: (body: unknown) => api.updt(id, body) }),
            reorder: { put: api.reorder },
            del: ({ id }: { id: string }) => ({ delete: () => api.del(id) }),
          },
        },
      },
    },
  },
}));

import type { PdfMultiItem } from '@/app/admin/_com/upload/PdfMultiDropzoneField';
import state, { type DokumenDasarHukum } from '@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dokumenDasarHukum';

// test-only: berkas dan baris rekaan.
const pdf = (name: string) => new File(['x'], name, { type: 'application/pdf' });
const item = (key: string, judul: string, extra: Partial<PdfMultiItem> = {}): PdfMultiItem => ({
  key,
  file: pdf(`${key}.pdf`),
  judul,
  ...extra,
});
const row = (id: string, urutan: number): DokumenDasarHukum => ({
  id,
  judul: `Dokumen ${id}`,
  urutan,
  file: { id: `f-${id}`, link: `/api/fileStorage/findUnique/${id}.pdf`, realName: `${id}.pdf` },
});
const ok = { status: 200, error: null };
const pending = () => state.pending.items;

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  state.pending.setItems([]);
  state.pending.saving = false;
  state.list.data = [];
  state.list.drafts = {};
  state.list.busyId = null;
  api.findMany.mockResolvedValue({ status: 200, data: { success: true, data: [] } });
});

describe('pending.createMany', () => {
  it('mengunggah dan menyimpan tiap berkas berurutan sesuai pilihan, lalu mengosongkan antrean', async () => {
    const log: string[] = [];
    uploadPdfFile.mockImplementation(async (file: File) => {
      log.push(`unggah ${file.name}`);
      return `id-${file.name}`;
    });
    api.create.mockImplementation(async (body: { judul: string }) => {
      log.push(`simpan ${body.judul}`);
      return ok;
    });
    state.pending.setItems([item('a', 'Perdes A'), item('b', 'Perdes B')]);

    expect(await state.pending.createMany()).toEqual({ berhasil: 2, gagal: 0 });
    expect(log).toEqual(['unggah a.pdf', 'simpan Perdes A', 'unggah b.pdf', 'simpan Perdes B']);
    expect(api.create).toHaveBeenCalledWith({ judul: 'Perdes A', fileId: 'id-a.pdf' });
    expect(pending()).toHaveLength(0);
    expect(api.findMany).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledOnce();
    expect(state.pending.saving).toBe(false);
  });

  it('satu unggahan gagal tidak membatalkan yang lain; yang gagal tetap di antrean bertanda gagal', async () => {
    uploadPdfFile.mockImplementation(async (file: File) => (file.name === 'b.pdf' ? null : `id-${file.name}`));
    api.create.mockResolvedValue(ok);
    state.pending.setItems([item('a', 'A'), item('b', 'B'), item('c', 'C')]);

    expect(await state.pending.createMany()).toEqual({ berhasil: 2, gagal: 1 });
    expect(api.create.mock.calls.map(([body]) => body.judul)).toEqual(['A', 'C']);
    expect(pending().map((p) => [p.key, p.status])).toEqual([['b', 'gagal']]);
    expect(pending()[0].pesan).toBeTruthy();
    expect(toast.error).toHaveBeenCalledOnce();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('simpan ditolak server: pesan server tampil di berkas itu, berkas lain lanjut, ulang tidak mengunggah dobel', async () => {
    uploadPdfFile.mockImplementation(async (file: File) => `id-${file.name}`);
    api.create
      .mockResolvedValueOnce({ status: 400, error: { value: { message: 'Judul dokumen wajib diisi' } } })
      .mockResolvedValueOnce(ok);
    state.pending.setItems([item('a', 'A'), item('b', 'B')]);

    expect(await state.pending.createMany()).toEqual({ berhasil: 1, gagal: 1 });
    expect(pending()).toHaveLength(1);
    expect(pending()[0]).toMatchObject({ key: 'a', status: 'gagal', pesan: 'Judul dokumen wajib diisi', fileId: 'id-a.pdf' });

    api.create.mockResolvedValueOnce(ok);
    expect(await state.pending.createMany()).toEqual({ berhasil: 1, gagal: 0 });
    expect(uploadPdfFile).toHaveBeenCalledTimes(2); // a.pdf & b.pdf, tidak ada unggah ulang a.pdf
    expect(api.create).toHaveBeenLastCalledWith({ judul: 'A', fileId: 'id-a.pdf' });
    expect(pending()).toHaveLength(0);
  });

  it('judul tidak valid ditandai gagal tanpa mengunggah berkasnya', async () => {
    uploadPdfFile.mockResolvedValue('id-ok');
    api.create.mockResolvedValue(ok);
    state.pending.setItems([item('a', '   '), item('b', 'B')]);

    expect(await state.pending.createMany()).toEqual({ berhasil: 1, gagal: 1 });
    expect(uploadPdfFile).toHaveBeenCalledOnce();
    expect(pending()[0]).toMatchObject({ key: 'a', status: 'gagal', pesan: 'Judul dokumen wajib diisi' });
  });

  it('galat jaringan pada satu berkas ditangkap dengan konteks dan tidak menghentikan antrean', async () => {
    uploadPdfFile.mockImplementation(async (file: File) => `id-${file.name}`);
    api.create.mockRejectedValueOnce(new Error('jaringan putus')).mockResolvedValueOnce(ok);
    state.pending.setItems([item('a', 'A'), item('b', 'B')]);

    expect(await state.pending.createMany()).toEqual({ berhasil: 1, gagal: 1 });
    expect(pending()[0].status).toBe('gagal');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('a.pdf'), 'jaringan putus');
  });
});

describe('pending.setItems', () => {
  it('berkas tetap objek File asli (tidak dibungkus proxy) sehingga nama & unggahnya terbaca', () => {
    const file = pdf('asli.pdf');
    state.pending.setItems([{ key: 'k', file, judul: 'Asli' }]);
    expect(pending()[0].file).toBe(file);
    expect(pending()[0].file.name).toBe('asli.pdf');
  });
});

describe('list', () => {
  it('load: mengisi data dari API; gagal → toast galat dan loading kembali false', async () => {
    api.findMany.mockResolvedValueOnce({ status: 200, data: { success: true, data: [row('a', 0)] } });
    await state.list.load();
    expect(state.list.data.map((r) => r.id)).toEqual(['a']);
    api.findMany.mockResolvedValueOnce({ status: 500, data: null });
    await state.list.load();
    expect(toast.error).toHaveBeenCalledOnce();
    expect(state.list.loading).toBe(false);
  });

  it('rename: kirim judul rapi lalu muat ulang; judul kosong ditolak tanpa memanggil API', async () => {
    state.list.drafts = { a: '  Judul   Baru ', b: '  ' };
    api.updt.mockResolvedValue(ok);
    expect(await state.list.rename('a')).toBe(true);
    expect(api.updt).toHaveBeenCalledWith('a', { judul: 'Judul Baru' });
    expect(state.list.drafts).not.toHaveProperty('a');
    expect(await state.list.rename('b')).toBe(false);
    expect(api.updt).toHaveBeenCalledTimes(1);
  });

  it('move: kirim urutan id yang sudah ditukar; di tepi daftar tidak memanggil API', async () => {
    state.list.data = [row('a', 0), row('b', 1), row('c', 2)];
    api.reorder.mockResolvedValue(ok);
    expect(await state.list.move('c', -1)).toBe(true);
    expect(api.reorder).toHaveBeenCalledWith({ ids: ['a', 'c', 'b'] });
    expect(state.list.data.map((r) => [r.id, r.urutan])).toEqual([['a', 0], ['c', 1], ['b', 2]]);
    expect(await state.list.move('a', -1)).toBe(false);
    expect(await state.list.move('b', 1)).toBe(false);
    expect(api.reorder).toHaveBeenCalledTimes(1);
  });

  it('move ditolak server: urutan lokal tidak berubah dan pengguna diberi tahu', async () => {
    state.list.data = [row('a', 0), row('b', 1)];
    api.reorder.mockResolvedValue({ status: 400, error: { value: { message: 'Daftar urutan tidak valid' } } });
    expect(await state.list.move('a', 1)).toBe(false);
    expect(state.list.data.map((r) => r.id)).toEqual(['a', 'b']);
    expect(toast.error).toHaveBeenCalledWith('Daftar urutan tidak valid');
  });

  it('remove: hapus lewat API lalu keluarkan dari daftar; gagal → daftar tetap', async () => {
    state.list.data = [row('a', 0), row('b', 1)];
    api.del.mockResolvedValueOnce(ok);
    expect(await state.list.remove('a')).toBe(true);
    expect(api.del).toHaveBeenCalledWith('a');
    expect(state.list.data.map((r) => r.id)).toEqual(['b']);
    api.del.mockResolvedValueOnce({ status: 403, error: { value: { message: 'Hanya admin' } } });
    expect(await state.list.remove('b')).toBe(false);
    expect(state.list.data).toHaveLength(1);
    expect(state.list.busyId).toBeNull();
  });
});
