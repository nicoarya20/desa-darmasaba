// @vitest-environment node
// Tim Pengelola Website: state Valtio admin/publik. fetch, toast, dan unggah PDF di-mock: muat publik (sukses, belum diisi,
// gagal, sekali saja) dan admin (dengan anggota), validasi sebelum kirim, simpan sukses (dengan/tanpa PDF baru) memperbarui
// data bersama tanpa anggota di sisi publik, serta simpan gagal.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, fetchMock, uploadPdfFileMock } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  fetchMock: vi.fn(),
  uploadPdfFileMock: vi.fn(),
}));
vi.mock('react-toastify', () => ({ toast }));
vi.mock('@/app/admin/_com/upload/pdf-upload', () => ({ uploadPdfFile: uploadPdfFileMock }));

import state, { toPublicRecord, toTimFormValues } from '@/app/admin/(dashboard)/_state/desa/timPengelola';
import type { TimPengelolaAdminRecord } from '@/lib/tim-pengelola';

// test-only: data rekaan (nama fiktif, bukan isi SK sebenarnya).
const ROW: TimPengelolaAdminRecord = {
  id: 'tim-pengelola-website',
  nomorSk: '99 Tahun 2026',
  tanggalSk: '2026-01-12T00:00:00.000Z',
  skFile: { id: 'file-1', link: '/api/img/sk-uji.pdf', realName: 'sk-uji.pdf' },
  anggota: [
    { nama: 'Anggota Uji Satu', jabatan: 'Ketua' },
    { nama: 'Anggota Uji Dua', jabatan: 'Sekretaris' },
  ],
  updatedAt: '2026-11-20T00:00:00.000Z',
};
const json = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status }));
const bodyOf = (call: number) => JSON.parse(fetchMock.mock.calls[call][1].body);

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', fetchMock); // dipasang per test: konfigurasi vitest mengembalikan global tiap test
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  Object.assign(state.findUnique, { data: null, loaded: false, loading: false, error: null });
  Object.assign(state.findAdmin, { data: null, loading: false, error: null });
  state.fillForm(null);
});

describe('toTimFormValues / toPublicRecord / fillForm', () => {
  it('data tersimpan → form: tanggal dipotong TTTT-BB-HH, anggota disalin; null → form kosong', () => {
    expect(toTimFormValues(ROW)).toEqual({ nomorSk: '99 Tahun 2026', tanggalSk: '2026-01-12', anggota: ROW.anggota });
    expect(toTimFormValues({ ...ROW, tanggalSk: null }).tanggalSk).toBe('');
    expect(toTimFormValues(null)).toEqual({ nomorSk: '', tanggalSk: '', anggota: [] });
  });

  it('form tidak berbagi array anggota dengan data tersimpan (edit form tak mengubah data)', () => {
    const form = toTimFormValues(ROW);
    form.anggota[0].nama = 'Diubah';
    expect(ROW.anggota[0].nama).toBe('Anggota Uji Satu');
  });

  it('toPublicRecord membuang anggota', () => {
    const publik = toPublicRecord(ROW);
    expect('anggota' in publik).toBe(false);
    expect(publik).toEqual({ id: ROW.id, nomorSk: ROW.nomorSk, tanggalSk: ROW.tanggalSk, skFile: ROW.skFile, updatedAt: ROW.updatedAt });
  });

  it('fillForm mengisi proxy form in-place (identitas objek form tetap)', () => {
    const form = state.form;
    state.fillForm(ROW);
    expect(state.form).toBe(form);
    expect(state.form.anggota).toHaveLength(2);
  });
});

describe('findUnique (publik)', () => {
  it('sukses: data tersimpan di state bersama dan loaded true', async () => {
    fetchMock.mockReturnValue(json(200, { success: true, data: toPublicRecord(ROW) }));
    expect(await state.findUnique.load()).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/api/desa/timpengelola');
    expect(state.findUnique).toMatchObject({ loaded: true, loading: false, error: null, data: { nomorSk: '99 Tahun 2026' } });
  });

  it('belum diisi (data null) tetap sukses dan loaded true', async () => {
    fetchMock.mockReturnValue(json(200, { success: true, data: null }));
    expect(await state.findUnique.load()).toBe(true);
    expect(state.findUnique).toMatchObject({ loaded: true, data: null });
  });

  it('gagal: error terisi, loaded tetap false, tanpa data bawaan', async () => {
    fetchMock.mockReturnValue(json(500, { success: false, message: 'Terjadi kesalahan' }));
    expect(await state.findUnique.load()).toBe(false);
    expect(state.findUnique).toMatchObject({ loaded: false, loading: false, error: 'Terjadi kesalahan', data: null });
  });

  it('ensureLoaded hanya memuat sekali setelah sukses', async () => {
    fetchMock.mockImplementation(() => json(200, { success: true, data: null }));
    await state.findUnique.ensureLoaded();
    await state.findUnique.ensureLoaded();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('findAdmin', () => {
  it('memuat dari endpoint admin dengan anggota', async () => {
    fetchMock.mockReturnValue(json(200, { success: true, data: ROW }));
    expect(await state.findAdmin.load()).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/api/desa/timpengelola/admin');
    expect(state.findAdmin.data?.anggota).toHaveLength(2);
  });

  it('403/401: error berpesan dari API, data tetap null', async () => {
    fetchMock.mockReturnValue(json(403, { success: false, message: 'Hanya admin yang boleh mengelola tim pengelola website' }));
    expect(await state.findAdmin.load()).toBe(false);
    expect(state.findAdmin).toMatchObject({ data: null, error: 'Hanya admin yang boleh mengelola tim pengelola website' });
  });
});

describe('update.submit', () => {
  it('isian tidak valid: toast galat, tidak ada unggahan dan tidak ada request', async () => {
    state.fillForm({ ...ROW, anggota: [{ nama: '', jabatan: 'Ketua' }] });
    expect(await state.update.submit(new File(['x'], 'sk.pdf'))).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Anggota ke-1: Nama wajib diisi');
    expect(uploadPdfFileMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sukses tanpa PDF baru: skFileId tidak dikirim (berkas tetap); data bersama diperbarui, sisi publik tanpa anggota', async () => {
    state.fillForm({ ...ROW, nomorSk: '  99   Tahun 2026 ' });
    fetchMock.mockReturnValue(json(200, { success: true, data: ROW }));
    expect(await state.update.submit(null)).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/desa/timpengelola');
    expect(init.method).toBe('PUT');
    expect(bodyOf(0)).toEqual({ nomorSk: '99 Tahun 2026', tanggalSk: '2026-01-12', anggota: ROW.anggota });
    expect('skFileId' in bodyOf(0)).toBe(false);
    expect(uploadPdfFileMock).not.toHaveBeenCalled();
    expect(state.findAdmin.data?.anggota).toHaveLength(2);
    expect(state.findUnique.loaded).toBe(true);
    expect(state.findUnique.data).toEqual(toPublicRecord(ROW));
    expect('anggota' in (state.findUnique.data ?? {})).toBe(false);
    expect(state.update.loading).toBe(false);
    expect(toast.success).toHaveBeenCalledWith('Tim pengelola website berhasil disimpan');
  });

  it('PDF baru: diunggah dulu, id-nya dikirim sebagai skFileId', async () => {
    uploadPdfFileMock.mockResolvedValue('file-baru');
    state.fillForm(ROW);
    fetchMock.mockReturnValue(json(200, { success: true, data: ROW }));
    const pdf = new File(['x'], 'sk.pdf', { type: 'application/pdf' });
    expect(await state.update.submit(pdf)).toBe(true);
    expect(uploadPdfFileMock).toHaveBeenCalledWith(pdf);
    expect(bodyOf(0).skFileId).toBe('file-baru');
  });

  it('unggah PDF gagal: tidak ada request simpan (toast sudah ditampilkan pengunggah)', async () => {
    uploadPdfFileMock.mockResolvedValue(null);
    state.fillForm(ROW);
    expect(await state.update.submit(new File(['x'], 'sk.pdf'))).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(state.update.loading).toBe(false);
  });

  it('simpan gagal: toast pesan API, state bersama tidak berubah', async () => {
    state.fillForm(ROW);
    fetchMock.mockReturnValue(json(400, { success: false, message: 'File dokumen harus berformat PDF' }));
    expect(await state.update.submit(null)).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('File dokumen harus berformat PDF');
    expect(state.findUnique.data).toBeNull();
    expect(state.findAdmin.data).toBeNull();
    expect(state.update.loading).toBe(false);
  });
});
