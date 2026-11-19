// @vitest-environment node
// Indeks Desa (IDM): state admin (Valtio). Daftar memetakan halaman ke query API; create/edit memvalidasi di klien dengan
// aturan yang sama dengan API (skor 0-1 termasuk koma desimal, status resmi, tahun) sebelum memanggil API, melaporkan
// hasil dengan benar, dan mengisi/mereset form IN-PLACE (identitas proxy stabil untuk useSnapshot sync).
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toast, api } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  api: { findMany: vi.fn(), create: vi.fn(), updt: vi.fn(), del: vi.fn(), get: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast }));
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      desa: {
        indeksdesa: Object.assign(({ id }: { id: string }) => ({ get: () => api.get(id) }), {
          'find-many': { get: api.findMany },
          create: { post: api.create },
          updt: ({ id }: { id: string }) => ({ put: (body: unknown) => api.updt(id, body) }),
          del: ({ id }: { id: string }) => ({ delete: () => api.del(id) }),
        }),
      },
    },
  },
}));

import state, { type IndeksDesaItem } from '@/app/admin/(dashboard)/_state/desa/indeksDesa';
import { PESAN_INDEKS_DESA } from '@/lib/indeks-desa';

// test-only: baris rekaan untuk menguji pemetaan, bukan data IDM Desa Darmasaba.
const ROW: IndeksDesaItem = { id: 'idm-1', tahun: 2030, skorIdm: 0.5, skorIks: 0.4, skorIke: 0.6, skorIkl: 0.7, status: 'Maju', catatan: null };
const FORM_VALID = { tahun: 2030, skorIdm: '0,5', skorIks: '0.4', skorIke: '0.6', skorIkl: '0.7', status: 'Maju', catatan: '' } as const;
const ok = { status: 200, error: null };
const fail = (message: string) => ({ status: 400, error: { value: { message } } });

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  state.create.reset();
  state.edit.id = '';
  Object.assign(state.edit.form, FORM_VALID, { tahun: null, skorIdm: '', status: null });
});

describe('findMany.load', () => {
  it('mengirim page dan limit, menyimpan data + totalPages', async () => {
    api.findMany.mockResolvedValue({ status: 200, data: { success: true, data: [ROW], totalPages: 3 } });
    await state.findMany.load(2);
    expect(api.findMany).toHaveBeenCalledWith({ query: { page: 2, limit: 10 } });
    expect(state.findMany.data).toEqual([ROW]);
    expect([state.findMany.page, state.findMany.totalPages, state.findMany.loading]).toEqual([2, 3, false]);
  });

  it('gagal (HTTP 500) → daftar dikosongkan dan toast galat', async () => {
    api.findMany.mockResolvedValue({ status: 500, data: null, error: { value: { message: 'Gagal mengambil daftar Indeks Desa' } } });
    await state.findMany.load();
    expect(state.findMany.data).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Gagal mengambil daftar Indeks Desa');
  });

  it('exception jaringan → dicatat berkonteks, toast, loading kembali false', async () => {
    api.findMany.mockRejectedValue(new Error('offline'));
    await state.findMany.load();
    expect(console.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(state.findMany.loading).toBe(false);
  });
});

describe('create.submit', () => {
  it('validasi gagal (skor kosong) → toast, API tidak dipanggil', async () => {
    Object.assign(state.create.form, FORM_VALID, { skorIdm: '' });
    expect(await state.create.submit()).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(PESAN_INDEKS_DESA.skorTidakValid('Skor IDM'));
    expect(api.create).not.toHaveBeenCalled();
  });

  it('skor di luar 0-1 dan status kosong ditolak di klien', async () => {
    Object.assign(state.create.form, FORM_VALID, { skorIke: '1,5' });
    expect(await state.create.submit()).toBe(false);
    expect(toast.error).toHaveBeenLastCalledWith(PESAN_INDEKS_DESA.skorTidakValid('Skor IKE'));
    Object.assign(state.create.form, FORM_VALID, { status: null });
    expect(await state.create.submit()).toBe(false);
    expect(toast.error).toHaveBeenLastCalledWith(PESAN_INDEKS_DESA.statusTidakValid);
    expect(api.create).not.toHaveBeenCalled();
  });

  it('isian tak sah seperti "0x1" atau "abc" ditolak (bukan dibaca sebagai angka)', async () => {
    for (const skorIkl of ['0x1', 'abc', '1e-1']) {
      Object.assign(state.create.form, FORM_VALID, { skorIkl });
      expect(await state.create.submit()).toBe(false);
    }
    expect(api.create).not.toHaveBeenCalled();
  });

  it('input sah (koma desimal dibaca sebagai titik) → API menerima angka, true + toast sukses', async () => {
    Object.assign(state.create.form, FORM_VALID);
    api.create.mockResolvedValue(ok);
    expect(await state.create.submit()).toBe(true);
    expect(api.create).toHaveBeenCalledWith({
      tahun: 2030, skorIdm: 0.5, skorIks: 0.4, skorIke: 0.6, skorIkl: 0.7, status: 'Maju', catatan: null,
    });
    expect(toast.success).toHaveBeenCalled();
    expect(state.create.loading).toBe(false);
  });

  it('API menolak (mis. tahun ganda) → pesan API di toast, false', async () => {
    Object.assign(state.create.form, FORM_VALID);
    api.create.mockResolvedValue(fail('Data Indeks Desa untuk tahun ini sudah ada'));
    expect(await state.create.submit()).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Data Indeks Desa untuk tahun ini sudah ada');
  });

  it('reset() mengosongkan form IN-PLACE (identitas proxy sama)', () => {
    const before = state.create.form;
    Object.assign(state.create.form, FORM_VALID);
    state.create.reset();
    expect(state.create.form).toBe(before);
    expect(state.create.form).toMatchObject({ tahun: null, skorIdm: '', status: null, catatan: '' });
  });
});

describe('edit.load / edit.submit', () => {
  it('load mengisi form IN-PLACE dengan skor sebagai teks', async () => {
    const before = state.edit.form;
    api.get.mockResolvedValue({ status: 200, data: { success: true, data: ROW } });
    expect(await state.edit.load('idm-1')).toBe(true);
    expect(state.edit.form).toBe(before);
    expect(state.edit.form).toMatchObject({ tahun: 2030, skorIdm: '0.5', status: 'Maju', catatan: '' });
    expect(state.edit.id).toBe('idm-1');
  });

  it('load gagal (404) → false dengan toast', async () => {
    api.get.mockResolvedValue({ status: 404, data: null, error: { value: { message: 'Data Indeks Desa tidak ditemukan' } } });
    expect(await state.edit.load('x')).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Data Indeks Desa tidak ditemukan');
  });

  it('submit memanggil PUT pada id yang dimuat', async () => {
    state.edit.id = 'idm-1';
    Object.assign(state.edit.form, FORM_VALID);
    api.updt.mockResolvedValue(ok);
    expect(await state.edit.submit()).toBe(true);
    expect(api.updt).toHaveBeenCalledWith('idm-1', expect.objectContaining({ tahun: 2030, skorIdm: 0.5 }));
  });
});

describe('delete.byId', () => {
  it('sukses → true; gagal → false dengan pesan API', async () => {
    api.del.mockResolvedValueOnce(ok).mockResolvedValueOnce(fail('Data Indeks Desa tidak ditemukan'));
    expect(await state.delete.byId('a')).toBe(true);
    expect(await state.delete.byId('b')).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Data Indeks Desa tidak ditemukan');
  });
});
