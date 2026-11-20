// @vitest-environment node
// Lembaga & Komunitas: state admin (Valtio). Daftar memetakan halaman/cari/jenis ke query API; create/edit memvalidasi di
// klien dengan aturan yang sama dengan API, mengurus foto (unggah baru / lepas / tetap), melaporkan hasil dengan benar,
// dan mengisi/mereset form IN-PLACE (identitas proxy stabil untuk useSnapshot sync).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, api, uploadImageFile } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  api: { findMany: vi.fn(), jenis: vi.fn(), create: vi.fn(), updt: vi.fn(), del: vi.fn(), get: vi.fn() },
  uploadImageFile: vi.fn(),
}));
vi.mock('react-toastify', () => ({ toast }));
vi.mock('@/app/admin/_com/upload/image-upload', () => ({ uploadImageFile }));
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      desa: {
        lembagakomunitas: Object.assign(({ id }: { id: string }) => ({ get: () => api.get(id) }), {
          'find-many': { get: api.findMany },
          jenis: { get: api.jenis },
          create: { post: api.create },
          updt: ({ id }: { id: string }) => ({ put: (body: unknown) => api.updt(id, body) }),
          del: ({ id }: { id: string }) => ({ delete: () => api.del(id) }),
        }),
      },
    },
  },
}));

import state, { type LembagaKomunitasItem } from '@/app/admin/(dashboard)/_state/desa/lembagaKomunitas';
import { PESAN_LEMBAGA_KOMUNITAS as PESAN } from '@/lib/lembaga-komunitas';

// test-only: baris rekaan untuk menguji pemetaan, bukan lembaga nyata Desa Darmasaba.
const ROW: LembagaKomunitasItem = {
  id: 'lk-1',
  nama: 'PKK Contoh',
  jenis: 'PKK',
  deskripsi: 'Uji',
  ketua: 'Ni Contoh',
  kontak: '0361-123456',
  urutan: 4,
  foto: { id: 'img-1', link: '/api/img/a.webp' },
};
const FORM_VALID = { nama: 'PKK Contoh', jenis: 'PKK', ketua: '', kontak: '', deskripsi: '', urutan: 0 } as const;
const TANPA_FOTO = { file: null, hapus: false } as const;
const ok = { status: 200, error: null };
const fail = (message: string) => ({ status: 400, error: { value: { message } } });

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  state.create.reset();
  state.edit.id = '';
  Object.assign(state.edit.form, FORM_VALID);
});

describe('findMany.load dan jenis.load', () => {
  it('mengirim page dan limit; q dan jenis hanya bila diisi; menyimpan data + totalPages', async () => {
    api.findMany.mockResolvedValue({ status: 200, data: { success: true, data: [ROW], totalPages: 3 } });
    await state.findMany.load(2);
    expect(api.findMany).toHaveBeenLastCalledWith({ query: { page: 2, limit: 10 } });
    expect(state.findMany.data).toEqual([ROW]);
    expect([state.findMany.page, state.findMany.totalPages, state.findMany.loading]).toEqual([2, 3, false]);

    await state.findMany.load(1, 'pkk', 'PKK');
    expect(api.findMany).toHaveBeenLastCalledWith({ query: { page: 1, limit: 10, q: 'pkk', jenis: 'PKK' } });
  });

  it('gagal (HTTP 500) → daftar dikosongkan dan toast galat; exception jaringan → dicatat, toast, loading false', async () => {
    api.findMany.mockResolvedValue({ status: 500, data: null, error: { value: { message: 'Gagal mengambil daftar' } } });
    await state.findMany.load();
    expect(state.findMany.data).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Gagal mengambil daftar');

    api.findMany.mockRejectedValue(new Error('jaringan putus'));
    await state.findMany.load();
    expect(console.error).toHaveBeenCalled();
    expect(state.findMany.loading).toBe(false);
  });

  it('jenis.load: menyimpan saran; gagal → saran kosong tanpa toast (form tetap bisa dipakai)', async () => {
    api.jenis.mockResolvedValue({ status: 200, data: { success: true, data: ['PKK', 'STT'] } });
    await state.jenis.load();
    expect(state.jenis.data).toEqual(['PKK', 'STT']);

    api.jenis.mockRejectedValue(new Error('jaringan putus'));
    await state.jenis.load();
    expect(state.jenis.data).toEqual([]);
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe('create.submit', () => {
  it('form tidak valid → toast pesan validasi, API dan unggah tidak dipanggil', async () => {
    state.create.form.nama = '   ';
    expect(await state.create.submit(TANPA_FOTO)).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(PESAN.wajib('Nama'));
    expect(api.create).not.toHaveBeenCalled();
    expect(uploadImageFile).not.toHaveBeenCalled();
  });

  it('kontak bukan telepon/email ditolak di klien dengan pesan yang sama dengan API', async () => {
    Object.assign(state.create.form, FORM_VALID, { kontak: 'hubungi ketua' });
    expect(await state.create.submit(TANPA_FOTO)).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(PESAN.kontakTidakValid);
  });

  it('tanpa foto → body tanpa fotoId; urutan kosong dikirim 0; sukses → toast sukses', async () => {
    api.create.mockResolvedValue(ok);
    Object.assign(state.create.form, FORM_VALID, { urutan: '' });
    expect(await state.create.submit(TANPA_FOTO)).toBe(true);
    const body = api.create.mock.calls[0][0];
    expect(body).toMatchObject({ nama: 'PKK Contoh', jenis: 'PKK', urutan: 0 });
    expect(body).not.toHaveProperty('fotoId');
    expect(toast.success).toHaveBeenCalled();
    expect(state.create.loading).toBe(false);
  });

  it('foto baru → diunggah dulu, id-nya dikirim sebagai fotoId; unggah gagal → tidak menyimpan', async () => {
    api.create.mockResolvedValue(ok);
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    uploadImageFile.mockResolvedValueOnce('img-9');
    Object.assign(state.create.form, FORM_VALID);
    expect(await state.create.submit({ file, hapus: false })).toBe(true);
    expect(uploadImageFile).toHaveBeenCalledWith(file);
    expect(api.create.mock.calls[0][0].fotoId).toBe('img-9');

    api.create.mockClear();
    uploadImageFile.mockResolvedValueOnce(null);
    expect(await state.create.submit({ file, hapus: false })).toBe(false);
    expect(api.create).not.toHaveBeenCalled();
    expect(state.create.loading).toBe(false);
  });

  it('API menolak (400) → toast pesan server; exception → toast umum dan loading kembali false', async () => {
    Object.assign(state.create.form, FORM_VALID);
    api.create.mockResolvedValue(fail('Foto tidak ditemukan di penyimpanan'));
    expect(await state.create.submit(TANPA_FOTO)).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Foto tidak ditemukan di penyimpanan');

    api.create.mockRejectedValue(new Error('jaringan putus'));
    expect(await state.create.submit(TANPA_FOTO)).toBe(false);
    expect(console.error).toHaveBeenCalled();
    expect(state.create.loading).toBe(false);
  });

  it('reset mengisi ulang form IN-PLACE (identitas proxy sama)', () => {
    const form = state.create.form;
    form.nama = 'ubah';
    state.create.reset();
    expect(state.create.form).toBe(form);
    expect(form).toEqual({ nama: '', jenis: '', ketua: '', kontak: '', deskripsi: '', urutan: 0 });
  });
});

describe('edit.load dan edit.submit', () => {
  it('load: mengisi form IN-PLACE, menyimpan foto saat ini; kolom kosong jadi ""; tidak ditemukan → false + toast', async () => {
    const form = state.edit.form;
    api.get.mockResolvedValue({ status: 200, data: { success: true, data: { ...ROW, ketua: null, deskripsi: null, kontak: null } } });
    expect(await state.edit.load('lk-1')).toBe(true);
    expect(state.edit.form).toBe(form);
    expect(form).toEqual({ nama: 'PKK Contoh', jenis: 'PKK', ketua: '', kontak: '', deskripsi: '', urutan: 4 });
    expect(state.edit.currentFoto).toEqual(ROW.foto);
    expect(state.edit.id).toBe('lk-1');

    api.get.mockResolvedValue({ status: 404, data: null, error: { value: { message: 'Lembaga atau komunitas tidak ditemukan' } } });
    expect(await state.edit.load('hilang')).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Lembaga atau komunitas tidak ditemukan');
  });

  it('submit tanpa mengubah foto → fotoId tidak dikirim; memilih foto baru → fotoId baru; melepas → fotoId null', async () => {
    api.updt.mockResolvedValue(ok);
    state.edit.id = 'lk-1';
    expect(await state.edit.submit(TANPA_FOTO)).toBe(true);
    expect(api.updt.mock.calls[0][0]).toBe('lk-1');
    expect(api.updt.mock.calls[0][1]).not.toHaveProperty('fotoId');

    uploadImageFile.mockResolvedValueOnce('img-baru');
    await state.edit.submit({ file: new File(['x'], 'b.png', { type: 'image/png' }), hapus: false });
    expect(api.updt.mock.calls[1][1].fotoId).toBe('img-baru');

    await state.edit.submit({ file: null, hapus: true });
    expect(api.updt.mock.calls[2][1]).toHaveProperty('fotoId', null);
  });

  it('submit tidak valid → toast dan API tidak dipanggil; API gagal → toast pesan server', async () => {
    state.edit.id = 'lk-1';
    state.edit.form.jenis = '';
    expect(await state.edit.submit(TANPA_FOTO)).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(PESAN.wajib('Jenis'));
    expect(api.updt).not.toHaveBeenCalled();

    state.edit.form.jenis = 'PKK';
    api.updt.mockResolvedValue(fail('Lembaga atau komunitas tidak ditemukan'));
    expect(await state.edit.submit(TANPA_FOTO)).toBe(false);
    expect(toast.error).toHaveBeenLastCalledWith('Lembaga atau komunitas tidak ditemukan');
  });
});

describe('delete.byId', () => {
  it('sukses → true + toast; gagal → false + toast pesan server; exception → false, loading false', async () => {
    api.del.mockResolvedValue(ok);
    expect(await state.delete.byId('lk-1')).toBe(true);
    expect(api.del).toHaveBeenCalledWith('lk-1');
    expect(toast.success).toHaveBeenCalled();

    api.del.mockResolvedValue(fail('Hanya admin yang boleh mengelola Lembaga & Komunitas'));
    expect(await state.delete.byId('lk-1')).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Hanya admin yang boleh mengelola Lembaga & Komunitas');

    api.del.mockRejectedValue(new Error('jaringan putus'));
    expect(await state.delete.byId('lk-1')).toBe(false);
    expect(state.delete.loading).toBe(false);
  });
});
