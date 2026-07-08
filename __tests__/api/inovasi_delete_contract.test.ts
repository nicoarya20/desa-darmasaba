// @vitest-environment node
// Kontrak delete.byId domain Inovasi — HARUS return boolean (true=sukses,
// false=gagal) supaya handleHapus bisa redirect kondisional & tak balapan
// dengan navigasi (akar bug "delete tampak gagal": item terhapus masih tampil
// karena router.push berlari mendahului DELETE yang belum commit).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Redam toast agar tak butuh DOM container saat unit test state.
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import programKreatifState from '@/app/admin/(dashboard)/_state/inovasi/program-kreatif';
import desaDigitalState from '@/app/admin/(dashboard)/_state/inovasi/desa-digital';
import infoTeknoState from '@/app/admin/(dashboard)/_state/inovasi/info-tekno';
import kolaborasiInovasiState from '@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi';

const cases = [
  { label: 'programkreatif', del: programKreatifState.delete, find: programKreatifState.findMany },
  { label: 'desadigital', del: desaDigitalState.delete, find: desaDigitalState.findMany },
  { label: 'infotekno', del: infoTeknoState.delete, find: infoTeknoState.findMany },
  { label: 'kolaborasiinovasi', del: kolaborasiInovasiState.delete, find: kolaborasiInovasiState.findMany },
];

// Response palsu ringan — cukup untuk .ok, .status, .json() yang dipakai byId.
function fakeResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  // Diamkan refresh list pasca-delete sukses (bukan fokus test).
  cases.forEach((c) => vi.spyOn(c.find, 'load').mockResolvedValue(undefined as never));
});
afterEach(() => vi.restoreAllMocks());

describe('delete.byId return boolean', () => {
  it('id kosong → false (tanpa panggil server)', async () => {
    for (const c of cases) {
      expect(await c.del.byId('')).toBe(false);
    }
  });

  it('respons sukses (success:true) → true', async () => {
    for (const c of cases) {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        fakeResponse({ success: true, message: 'ok' })
      );
      expect(await c.del.byId('abc')).toBe(true);
      vi.restoreAllMocks();
      cases.forEach((cc) => vi.spyOn(cc.find, 'load').mockResolvedValue(undefined as never));
    }
  });

  it('respons gagal (success:false) → false', async () => {
    for (const c of cases) {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        fakeResponse({ success: false, message: 'gagal' })
      );
      expect(await c.del.byId('abc')).toBe(false);
      vi.restoreAllMocks();
    }
  });

  it('HTTP error (500) → false', async () => {
    for (const c of cases) {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        fakeResponse({ success: false }, false, 500)
      );
      expect(await c.del.byId('abc')).toBe(false);
      vi.restoreAllMocks();
    }
  });

  it('fetch throw (network error) → false', async () => {
    for (const c of cases) {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
      expect(await c.del.byId('abc')).toBe(false);
      vi.restoreAllMocks();
    }
  });
});
