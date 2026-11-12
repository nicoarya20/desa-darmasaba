// @vitest-environment node
// Kontrak: stateLayananDesa.ajukanPermohonan.create.create() mengembalikan status submit
// (false = validasi gagal / status ≠ 200 / exception, true = tersimpan), agar modal "Ajukan Permohonan"
// di detail layanan hanya mereset + menutup saat sukses — input warga tidak hilang saat gagal.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('react-toastify', () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    error: (...a: unknown[]) => toastError(...a),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import ajukanPermohonan from '@/app/admin/(dashboard)/_state/desa/layananDesa/ajukan-permohonan';

const CREATE_URL = 'http://localhost:3000/api/desa/ajukanpermohonan/create';

// test-only: isian valid sesuai skema zod create().
const validForm = {
  nama: 'Warga Uji',
  nik: '5103010101010001',
  alamat: 'Banjar Uji',
  nomorKk: '5103010101010002',
  kategoriId: 'k1',
};

let loadSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  loadSpy = vi.spyOn(ajukanPermohonan.findMany, 'load').mockResolvedValue(undefined as never);
  ajukanPermohonan.create.form = { ...validForm };
});

afterEach(() => {
  vi.restoreAllMocks();
  server.resetHandlers();
  ajukanPermohonan.create.loading = false;
});

describe('ajukanPermohonan.create.create — status submit', () => {
  it('validasi gagal (field kosong) → false, toast.error, tanpa request', async () => {
    let called = false;
    server.use(http.post(CREATE_URL, () => { called = true; return HttpResponse.json({ success: true }); }));
    ajukanPermohonan.create.form = { ...validForm, nama: '' };

    await expect(ajukanPermohonan.create.create()).resolves.toBe(false);
    expect(called).toBe(false);
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('sukses (200) → true, payload = form, toast.success, daftar dimuat ulang', async () => {
    let body: unknown;
    server.use(
      http.post(CREATE_URL, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, data: { id: 'x' } });
      }),
    );

    await expect(ajukanPermohonan.create.create()).resolves.toBe(true);
    expect(body).toEqual(validForm);
    expect(toastSuccess).toHaveBeenCalledWith('Ajukan permohonan berhasil disimpan!');
    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(ajukanPermohonan.create.loading).toBe(false);
  });

  it('API gagal (500) → false, toast.error, form tidak diubah', async () => {
    server.use(http.post(CREATE_URL, () => HttpResponse.json({ success: false }, { status: 500 })));

    await expect(ajukanPermohonan.create.create()).resolves.toBe(false);
    expect(toastError).toHaveBeenCalledWith('Gagal menyimpan ajukan permohonan');
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
    expect(ajukanPermohonan.create.form).toEqual(validForm);
    expect(ajukanPermohonan.create.loading).toBe(false);
  });

  it('jaringan gagal → false, toast.error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(http.post(CREATE_URL, () => HttpResponse.error()));

    await expect(ajukanPermohonan.create.create()).resolves.toBe(false);
    expect(toastError).toHaveBeenCalledWith('Gagal menyimpan ajukan permohonan');
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(ajukanPermohonan.create.loading).toBe(false);
  });
});
