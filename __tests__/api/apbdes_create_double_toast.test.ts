// @vitest-environment node
// Regresi: create APBDes saat TAHUN DUPLIKAT (409) tidak boleh memunculkan
// toast "gagal" DAN "berhasil" sekaligus.
//
// Bug lama: state `create.create()` menelan error (toast sendiri, tanpa
// throw/return status), sehingga page selalu lanjut ke toast.success + redirect.
// Selain itu Eden menaruh body respons non-2xx di res.error.value (bukan
// res.data), jadi pesan spesifik backend ("...sudah tersedia") ikut hilang.
// Test ini mengunci: (1) create() mengembalikan boolean sesuai hasil,
// (2) pesan 409 dibaca dari res.error.value, (3) tidak ada toast sukses saat gagal.
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

import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes';

const BASE = 'http://localhost:3000';

// Isi form minimal valid (Zod butuh >=1 item) sebelum tiap test.
function seedValidForm() {
  apbdes.create.reset();
  apbdes.create.addItem({ kode: '4', uraian: 'Pendapatan', anggaran: 1000, level: 1, tipe: null });
  apbdes.create.form.tahun = 2025;
}

beforeEach(() => {
  vi.clearAllMocks();
  // Diamkan refresh list pasca-sukses.
  vi.spyOn(apbdes.findMany, 'load').mockResolvedValue(undefined as never);
  seedValidForm();
});
afterEach(() => {
  vi.restoreAllMocks();
  server.resetHandlers();
  apbdes.create.reset();
});

describe('apbdes.create.create — tahun duplikat (409)', () => {
  it('409 → return false, toast.error pakai pesan backend, TANPA toast.success', async () => {
    server.use(
      http.post(`${BASE}/api/landingpage/apbdes/create`, () =>
        HttpResponse.json(
          { success: false, message: 'APBDes tahun 2025 sudah tersedia. Pilih tahun lain atau ubah data yang sudah ada.' },
          { status: 409 }
        )
      )
    );

    const ok = await apbdes.create.create();

    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalledWith(expect.stringContaining('sudah tersedia'));
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});

describe('apbdes.create.create — sukses (200)', () => {
  it('200 success:true → return true, toast.success, TANPA toast.error', async () => {
    server.use(
      http.post(`${BASE}/api/landingpage/apbdes/create`, () =>
        HttpResponse.json({ success: true, message: 'Berhasil membuat APBDes', data: { id: 'a1' } })
      )
    );

    const ok = await apbdes.create.create();

    expect(ok).toBe(true);
    expect(toastSuccess).toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });
});

describe('apbdes.create.create — validasi lokal (Zod)', () => {
  it('items kosong → return false tanpa hit network', async () => {
    apbdes.create.reset(); // 0 item
    apbdes.create.form.tahun = 2025;

    const ok = await apbdes.create.create();

    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
