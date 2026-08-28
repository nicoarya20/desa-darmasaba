// @vitest-environment node
// Regresi UX: sdgsDesa.delete.byId harus mengembalikan boolean sukses/gagal.
//
// Bug ditemukan via review source: halaman detail SDGs (SDGs/[id]/page.tsx)
// memanggil delete tanpa await lalu langsung router.push ke List, sehingga
// admin ke-redirect sebelum request delete selesai — kegagalan (toast.error)
// mudah tidak kesadar. Fix: byId return true (sukses) / false (gagal), dan
// pemanggil hanya redirect saat true. Test ini mengunci kontrak boolean itu.
//
// Catatan: state pakai fetch(relative) — tak bisa via msw di env node (URL
// relatif dilempar) dan @prisma/client tak bisa di-require di jsdom, jadi
// global fetch di-stub langsung.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const toastError = vi.fn();
const toastSuccess = vi.fn();
const toastWarn = vi.fn();
vi.mock('react-toastify', () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    error: (...a: unknown[]) => toastError(...a),
    warn: (...a: unknown[]) => toastWarn(...a),
    info: vi.fn(),
  },
}));

import sdgsDesa from '@/app/admin/(dashboard)/_state/landing-page/sdgs-desa';

function stubFetch(impl: () => Promise<{ ok: boolean; body: unknown }>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      const { ok, body } = await impl();
      return { ok, json: async () => body } as Response;
    })
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Diamkan refresh list pasca-sukses.
  vi.spyOn(sdgsDesa.findMany, 'load').mockResolvedValue(undefined as never);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('sdgsDesa.delete.byId — kontrak boolean sukses/gagal', () => {
  it('sukses (200 success:true) → return true + toast.success', async () => {
    stubFetch(async () => ({ ok: true, body: { success: true, message: 'Berhasil menghapus SDGS Desa' } }));
    const ok = await sdgsDesa.delete.byId('s1');
    expect(ok).toBe(true);
    expect(toastSuccess).toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it('gagal (400 success:false) → return false + toast.error (pemanggil TIDAK redirect)', async () => {
    stubFetch(async () => ({ ok: false, body: { success: false, message: 'Gagal menghapus' } }));
    const ok = await sdgsDesa.delete.byId('s1');
    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('network error → return false + toast.error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));
    const ok = await sdgsDesa.delete.byId('s1');
    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalled();
  });

  it('id kosong → return false + toast.warn, tanpa hit network', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const ok = await sdgsDesa.delete.byId('');
    expect(ok).toBe(false);
    expect(toastWarn).toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('loading kembali false setelah selesai (finally)', async () => {
    stubFetch(async () => ({ ok: true, body: { success: true, message: 'ok' } }));
    await sdgsDesa.delete.byId('s1');
    expect(sdgsDesa.delete.loading).toBe(false);
  });
});
