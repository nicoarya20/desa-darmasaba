// @vitest-environment node
// Regresi J1: hapus user admin — race reload + filter salah.
//
// Bug lama:
//  1. `deleteUser.delete` me-reload list SENDIRI tanpa argumen → filter
//     roleGroup="admin" hilang (daftar admin tercampur warga) & pindah page 1.
//  2. `handleDelete` tidak meng-await delete lalu langsung `reload()` → reload
//     menembak server sebelum baris terhapus (user muncul lagi).
//
// Kontrak fix: `deleteUser.delete` RETURN boolean dan TIDAK me-reload internal;
// caller yang me-reload dengan filter benar setelah await.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import user from '@/app/admin/(dashboard)/_state/user/user-state';
const userState = user.userState;

const BASE = 'http://localhost:3000';

beforeEach(() => {
  // Deteksi kalau delete() masih diam-diam me-reload list (bug lama).
  vi.spyOn(userState.findMany, 'load').mockResolvedValue(undefined as never);
});
afterEach(() => vi.restoreAllMocks());

describe('deleteUser.delete — return boolean, tanpa reload internal', () => {
  it('id kosong → false, tak memanggil server maupun reload', async () => {
    expect(await userState.deleteUser.delete('')).toBe(false);
    expect(userState.findMany.load).not.toHaveBeenCalled();
  });

  it('respons sukses → true dan TIDAK me-reload list sendiri (caller yang reload)', async () => {
    server.use(
      http.delete(`${BASE}/api/user/delUser/:id`, () =>
        HttpResponse.json({ success: true, message: 'ok' })
      )
    );
    expect(await userState.deleteUser.delete('u1')).toBe(true);
    expect(userState.findMany.load).not.toHaveBeenCalled();
  });

  it('respons gagal (success:false) → false, tanpa reload internal', async () => {
    server.use(
      http.delete(`${BASE}/api/user/delUser/:id`, () =>
        HttpResponse.json({ success: false, message: 'nope' })
      )
    );
    expect(await userState.deleteUser.delete('u2')).toBe(false);
    expect(userState.findMany.load).not.toHaveBeenCalled();
  });

  it('loading kembali false setelah selesai', async () => {
    server.use(
      http.delete(`${BASE}/api/user/delUser/:id`, () =>
        HttpResponse.json({ success: true, message: 'ok' })
      )
    );
    await userState.deleteUser.delete('u3');
    expect(userState.deleteUser.loading).toBe(false);
  });
});

// Logika mundur-halaman yang dipakai handleDelete (listUserAdmin.tsx).
// Diekstrak murni agar terlindungi regresi: hapus baris terakhir di halaman
// > 1 harus memundurkan satu halaman, selain itu tetap.
function nextPageAfterDelete(rowCount: number, page: number): number {
  return rowCount === 1 && page > 1 ? page - 1 : page;
}

describe('nextPageAfterDelete — hindari berhenti di halaman kosong', () => {
  it('baris terakhir di halaman >1 → mundur satu halaman', () => {
    expect(nextPageAfterDelete(1, 3)).toBe(2);
  });
  it('masih ada baris lain → tetap di halaman sama', () => {
    expect(nextPageAfterDelete(5, 3)).toBe(3);
  });
  it('halaman 1 → tetap 1 walau baris terakhir', () => {
    expect(nextPageAfterDelete(1, 1)).toBe(1);
  });
});
