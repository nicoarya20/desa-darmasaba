// @vitest-environment node
// Kontrak delete.byId domain Inovasi — HARUS return boolean (true=sukses,
// false=gagal) supaya handleHapus bisa redirect kondisional.
//
// byId memakai Eden (ApiFetch), konsisten dgn pola delete yang bekerja
// (landing-page/program-inovasi). Eden TIDAK menyetel Content-Type json untuk
// DELETE tanpa body — itulah yang dulu memicu 400 "Bad Request" (Elysia parse
// body kosong) saat state ini masih pakai raw fetch + header json.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Redam toast agar tak butuh DOM container saat unit test state.
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import programKreatifState from '@/app/admin/(dashboard)/_state/inovasi/program-kreatif';
import desaDigitalState from '@/app/admin/(dashboard)/_state/inovasi/desa-digital';
import infoTeknoState from '@/app/admin/(dashboard)/_state/inovasi/info-tekno';
import kolaborasiInovasiState from '@/app/admin/(dashboard)/_state/inovasi/kolaborasi-inovasi';

const BASE = 'http://localhost:3000';

const cases = [
  { path: 'programkreatif', del: programKreatifState.delete, find: programKreatifState.findMany },
  { path: 'desadigital', del: desaDigitalState.delete, find: desaDigitalState.findMany },
  { path: 'infotekno', del: infoTeknoState.delete, find: infoTeknoState.findMany },
  { path: 'kolaborasiinovasi', del: kolaborasiInovasiState.delete, find: kolaborasiInovasiState.findMany },
];

// Assert DELETE tak membawa Content-Type json (biang 400 di Elysia).
function assertNoJsonContentType(request: Request) {
  const ct = request.headers.get('content-type') || '';
  expect(ct.includes('application/json')).toBe(false);
}

beforeEach(() => {
  // Diamkan refresh list pasca-delete sukses (bukan fokus test).
  cases.forEach((c) => vi.spyOn(c.find, 'load').mockResolvedValue(undefined as never));
});
afterEach(() => vi.restoreAllMocks());

describe('delete.byId (Eden) return boolean', () => {
  it('id kosong → false (tanpa panggil server)', async () => {
    for (const c of cases) {
      expect(await c.del.byId('')).toBe(false);
    }
  });

  it('respons sukses (success:true) → true, DELETE tanpa Content-Type json', async () => {
    for (const c of cases) {
      server.use(
        http.delete(`${BASE}/api/inovasi/${c.path}/del/:id`, ({ request }) => {
          assertNoJsonContentType(request);
          return HttpResponse.json({ success: true, message: 'ok' });
        })
      );
      expect(await c.del.byId('abc')).toBe(true);
    }
  });

  it('respons gagal (success:false) → false', async () => {
    for (const c of cases) {
      server.use(
        http.delete(`${BASE}/api/inovasi/${c.path}/del/:id`, () =>
          HttpResponse.json({ success: false, message: 'gagal' })
        )
      );
      expect(await c.del.byId('abc')).toBe(false);
    }
  });

  it('HTTP error (500) → false', async () => {
    for (const c of cases) {
      server.use(
        http.delete(`${BASE}/api/inovasi/${c.path}/del/:id`, () =>
          HttpResponse.json({ success: false }, { status: 500 })
        )
      );
      expect(await c.del.byId('abc')).toBe(false);
    }
  });
});
