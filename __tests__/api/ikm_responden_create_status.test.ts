// @vitest-environment node
// Kontrak: indeksKepuasanState.responden.create.create() mengembalikan status submit
// (false = validasi gagal / status ≠ 200 / exception, true = tersimpan), agar modal beranda
// hanya mereset + menutup saat sukses. Toast di dalam create() tidak berubah.
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

import responden from '@/app/admin/(dashboard)/_state/landing-page/indeksKepuasan/responden';

const CREATE_URL = 'http://localhost:3000/api/landingpage/responden/create';

// test-only: isian valid sesuai skema zod create().
const validForm = {
  name: 'Warga Uji',
  tanggal: '2026-11-09',
  jenisKelaminId: 'jk1',
  ratingId: 'r1',
  kelompokUmurId: 'u1',
};

let loadSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  loadSpy = vi.spyOn(responden.findMany, 'load').mockResolvedValue(undefined as never);
  responden.create.form = { ...validForm };
});

afterEach(() => {
  vi.restoreAllMocks();
  server.resetHandlers();
  responden.create.loading = false;
});

describe('responden.create.create — status submit', () => {
  it('validasi gagal (field kosong) → false, toast.error, tanpa request', async () => {
    let called = false;
    server.use(http.post(CREATE_URL, () => { called = true; return HttpResponse.json({ success: true }); }));
    responden.create.form = { ...validForm, name: '', ratingId: '' };

    await expect(responden.create.create()).resolves.toBe(false);
    expect(called).toBe(false);
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(String(toastError.mock.calls[0][0])).toContain('Nama harus diisi');
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('sukses (200) → true, payload = form apa adanya, toast.success, daftar dimuat ulang', async () => {
    let body: unknown;
    server.use(
      http.post(CREATE_URL, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ success: true, message: 'ok', data: { id: 'x' } });
      }),
    );

    await expect(responden.create.create()).resolves.toBe(true);
    expect(body).toEqual(validForm);
    expect(toastSuccess).toHaveBeenCalledWith('Responden berhasil ditambahkan');
    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(responden.create.loading).toBe(false);
  });

  it('API gagal (409 nama dipakai) → false, toast.error, tanpa toast.success', async () => {
    server.use(
      http.post(CREATE_URL, () =>
        HttpResponse.json({ success: false, message: 'Nama sudah dipakai' }, { status: 409 }),
      ),
    );

    await expect(responden.create.create()).resolves.toBe(false);
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
    expect(responden.create.loading).toBe(false);
  });

  it('jaringan gagal → false, toast.error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(http.post(CREATE_URL, () => HttpResponse.error()));

    await expect(responden.create.create()).resolves.toBe(false);
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(responden.create.loading).toBe(false);
  });
});
