// @vitest-environment node
// Kontak Desa: state Valtio admin/publik. fetch dan toast di-mock: muat (sukses, belum diisi, gagal), validasi sebelum
// kirim (tidak ada request bila isian salah), simpan sukses memperbarui data bersama + form, dan simpan gagal.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, fetchMock } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  fetchMock: vi.fn(),
}));
vi.mock('react-toastify', () => ({ toast }));

import state, { toKontakFormValues } from '@/app/admin/(dashboard)/_state/desa/kontakDesa';
import type { KontakDesaRecord } from '@/lib/kontak-desa';

// test-only: baris dan isian rekaan.
const ROW: KontakDesaRecord = {
  id: 'kontak-desa',
  namaKantor: 'Kantor Uji',
  alamat: 'Jl. Uji No. 1',
  telepon: '(0361) 8441518',
  email: 'uji@example.com',
  updatedAt: '2026-11-19T00:00:00.000Z',
};
const json = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', fetchMock); // dipasang per test: konfigurasi vitest mengembalikan global tiap test
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  Object.assign(state.findUnique, { data: null, loaded: false, loading: false, error: null });
  state.fillForm(null);
});

describe('findUnique.load', () => {
  it('sukses: menyimpan data, menandai loaded, memanggil GET /api/desa/kontakdesa', async () => {
    fetchMock.mockReturnValue(json(200, { success: true, data: ROW }));
    expect(await state.findUnique.load()).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/api/desa/kontakdesa');
    expect(state.findUnique).toMatchObject({ data: ROW, loaded: true, loading: false, error: null });
  });

  it('baris belum ada (data null) tetap sukses dan loaded, supaya pembaca publik tidak memuat ulang', async () => {
    fetchMock.mockReturnValue(json(200, { success: true, data: null }));
    expect(await state.findUnique.load()).toBe(true);
    expect(state.findUnique).toMatchObject({ data: null, loaded: true });
  });

  it('gagal: false, pesan API tersimpan di error, data lama tidak dihapus, loaded tetap false', async () => {
    fetchMock.mockReturnValue(json(500, { success: false, message: 'Terjadi kesalahan saat mengambil kontak desa' }));
    expect(await state.findUnique.load()).toBe(false);
    expect(state.findUnique).toMatchObject({ error: 'Terjadi kesalahan saat mengambil kontak desa', loaded: false, loading: false });
  });

  it('jaringan putus: false dengan pesan galat', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    expect(await state.findUnique.load()).toBe(false);
    expect(state.findUnique.error).toBe('network down');
  });
});

describe('toKontakFormValues / fillForm', () => {
  it('data tersimpan → empat field form; null → form kosong', () => {
    expect(toKontakFormValues(ROW)).toEqual({ namaKantor: ROW.namaKantor, alamat: ROW.alamat, telepon: ROW.telepon, email: ROW.email });
    expect(toKontakFormValues(null)).toEqual({ namaKantor: '', alamat: '', telepon: '', email: '' });
  });

  it('fillForm mengisi proxy form in-place (identitas objek form tetap)', () => {
    const form = state.form;
    state.fillForm(ROW);
    expect(state.form).toBe(form);
    expect(state.form.email).toBe(ROW.email);
  });
});

describe('update.submit', () => {
  it('isian tidak valid: toast galat, tidak ada request', async () => {
    state.fillForm({ ...ROW, email: 'bukan-email' });
    expect(await state.update.submit()).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Format email tidak valid, mis. nama@desa.id');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sukses: PUT berisi isian rapi, data bersama + form diperbarui, toast sukses', async () => {
    state.fillForm({ ...ROW, namaKantor: '  Kantor   Baru ' });
    fetchMock.mockReturnValue(json(200, { success: true, data: { ...ROW, namaKantor: 'Kantor Baru' } }));
    expect(await state.update.submit()).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/desa/kontakdesa');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ namaKantor: 'Kantor Baru', alamat: ROW.alamat, telepon: ROW.telepon, email: ROW.email });
    expect(state.findUnique).toMatchObject({ loaded: true, data: { namaKantor: 'Kantor Baru' } });
    expect(state.form.namaKantor).toBe('Kantor Baru');
    expect(state.update.loading).toBe(false);
    expect(toast.success).toHaveBeenCalledWith('Kontak desa berhasil disimpan');
  });

  it('ditolak server (403): toast pesan server, data bersama tidak berubah', async () => {
    state.findUnique.data = ROW;
    state.fillForm(ROW);
    fetchMock.mockReturnValue(json(403, { success: false, message: 'Hanya admin yang boleh mengelola kontak desa' }));
    expect(await state.update.submit()).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Hanya admin yang boleh mengelola kontak desa');
    expect(state.findUnique.data).toEqual(ROW);
    expect(state.update.loading).toBe(false);
  });
});
