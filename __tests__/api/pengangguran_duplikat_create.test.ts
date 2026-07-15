// @vitest-environment node
// Kontrak create.create() domain Jumlah Pengangguran.
//
// Schema DetailDataPengangguran punya @@unique([month, year]). Saat bulan+tahun
// sudah terpakai, server balikan 409 { success:false, message }. State HARUS
// menampilkan pesan server itu (bukan "failed create" generik) dan return null.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Tangkap argumen toast.error agar bisa di-assert pesannya.
const toastError = vi.fn();
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: (...a: unknown[]) => toastError(...a), warn: vi.fn(), info: vi.fn() },
}));

import jumlahPengangguranState from '@/app/admin/(dashboard)/_state/ekonomi/jumlah-pengangguran';

const BASE = 'http://localhost:3000';
const CREATE_PATH = `${BASE}/api/ekonomi/jumlahpengangguran/detaildatapengangguran/create`;

const state = jumlahPengangguranState.jumlahPengangguran;

// Isi form valid supaya lolos zod guard di state sebelum hit server.
function seedValidForm() {
  state.create.form = {
    month: 'Mei',
    year: 2026,
    totalUnemployment: 10,
    educatedUnemployment: 6,
    uneducatedUnemployment: 4,
    percentageChange: 0,
  };
}

beforeEach(() => {
  toastError.mockClear();
  // Diamkan refresh list pasca-create sukses (bukan fokus test).
  vi.spyOn(state.findMany, 'load').mockResolvedValue(undefined as never);
  seedValidForm();
});
afterEach(() => vi.restoreAllMocks());

describe('jumlahPengangguran.create.create()', () => {
  it('sukses (200 + id) → return id', async () => {
    server.use(
      http.post(CREATE_PATH, () =>
        HttpResponse.json({ id: 'abc-123', month: 'Mei', year: 2026 })
      )
    );
    expect(await state.create.create()).toBe('abc-123');
  });

  it('duplikat bulan+tahun (409) → toast pakai pesan server, return null', async () => {
    const serverMsg =
      'Data bulan Mei tahun 2026 sudah terpakai. Silakan edit data yang ada atau pilih bulan lain.';
    server.use(
      http.post(CREATE_PATH, () =>
        HttpResponse.json({ success: false, message: serverMsg }, { status: 409 })
      )
    );
    expect(await state.create.create()).toBeNull();
    expect(toastError).toHaveBeenCalledWith(serverMsg);
  });

  it('form tidak valid → tidak hit server, return null', async () => {
    state.create.form = {
      month: '',
      year: 2026,
      totalUnemployment: 0,
      educatedUnemployment: 0,
      uneducatedUnemployment: 0,
      percentageChange: 0,
    };
    let hit = false;
    server.use(
      http.post(CREATE_PATH, () => {
        hit = true;
        return HttpResponse.json({ id: 'x' });
      })
    );
    expect(await state.create.create()).toBeNull();
    expect(hit).toBe(false);
  });
});
