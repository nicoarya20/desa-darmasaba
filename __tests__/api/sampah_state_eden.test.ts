// @vitest-environment node
// State Sampah lewat klien Eden asli (hanya global fetch di-stub): URL, method, dan query yang benar-benar
// terkirim — menjaga dari jebakan Eden seperti segmen path yang bentrok dengan nama method.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import sampahState from '@/app/admin/(dashboard)/_state/pengaturan/sampah-state';
import type { SampahItem } from '@/lib/sampah/sampah-item';

const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
const listBody = { success: true, data: { items: [], counts: { semua: 0 }, kelompok: [], page: 1, limit: 20, total: 0 } };
const item = { id: 'file:a1', judul: 'a1' } as SampahItem; // test-only

let fetchSpy: ReturnType<typeof vi.fn>;
const calls = () =>
  fetchSpy.mock.calls.map(([url, init]) => {
    const u = new URL(String(url));
    return `${(init as RequestInit | undefined)?.method ?? 'GET'} ${u.pathname}${u.search}`;
  });

beforeEach(() => {
  fetchSpy = vi.fn(async (_url: unknown, init?: RequestInit) =>
    json(init?.method && init.method !== 'GET' ? { success: true, message: 'ok', data: { dihapus: 0 } } : listBody),
  );
  vi.stubGlobal('fetch', fetchSpy);
  Object.assign(sampahState, { kelompokAktif: 'semua', page: 1, cari: '', items: [] });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('request Sampah yang terkirim', () => {
  it('load → GET /api/pengaturan/sampah dengan query kelompok/page/limit/cari', async () => {
    await sampahState.setCari('sk desa');
    expect(calls()).toEqual(['GET /api/pengaturan/sampah?kelompok=semua&page=1&limit=20&cari=sk%20desa']);
  });

  it('pulihkan → POST /:id/pulihkan lalu GET ulang', async () => {
    await sampahState.pulihkan(item);
    expect(calls()[0]).toBe('POST /api/pengaturan/sampah/file%3Aa1/pulihkan');
    expect(calls()[1]).toMatch(/^GET \/api\/pengaturan\/sampah\?/);
  });

  it('hapus permanen → DELETE /:id', async () => {
    await sampahState.hapusPermanen(item);
    expect(calls()[0]).toBe('DELETE /api/pengaturan/sampah/file%3Aa1');
  });

  it('kosongkan → DELETE /?kelompok=<aktif>', async () => {
    sampahState.kelompokAktif = 'PPID';
    await sampahState.kosongkan();
    expect(calls()[0]).toBe('DELETE /api/pengaturan/sampah?kelompok=PPID');
  });
});
