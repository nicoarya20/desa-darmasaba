// @vitest-environment node
// State panel Sampah per fitur: GET /api/sampah/:sumber (scopeId untuk APBDes), pulihkan & hapus permanen
// memanggil endpoint yang benar, memuat ulang daftar, memanggil callback induk, dan menampilkan toast.
import { describe, expect, it, vi } from 'vitest';
import { createSampahPanelState } from '@/app/admin/(dashboard)/_com/sampah/sampah-panel.state';
import type { SampahPanelItem } from '@/app/admin/(dashboard)/_com/sampah/sampah-panel.logic';

const item = (id: string, over: Partial<SampahPanelItem> = {}): SampahPanelItem => ({
  id,
  judul: `Dokumen ${id}`,
  mimeType: 'application/pdf',
  kategori: 'document',
  ukuran: 1024,
  pratinjauUrl: `/api/fileStorage/findUnique/${id}`,
  dihapusPada: '2026-11-10T00:00:00.000Z',
  sisaHari: 27,
  folderNama: null,
  ...over,
}); // test-only

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const halaman = (items: SampahPanelItem[], total = items.length, page = 1) =>
  json({ success: true, data: { items, total, page, limit: 20, retensiHari: 30 } });

/** Stub fetch: GET → antrean respons daftar; POST/DELETE → respons aksi. */
function setup(opts: { lists: Response[]; aksi?: Response }) {
  const lists = [...opts.lists];
  const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
    if ((init?.method ?? 'GET') === 'GET') return lists.shift() ?? halaman([]);
    return opts.aksi ?? json({ success: true, message: 'OK' });
  });
  const notify = { success: vi.fn(), error: vi.fn() };
  return { fetchImpl, notify, deps: { fetchImpl: fetchImpl as unknown as typeof fetch, notify } };
}

const calls = (fetchImpl: ReturnType<typeof setup>['fetchImpl']) =>
  fetchImpl.mock.calls.map(([url, init]) => `${init?.method ?? 'GET'} ${url}`);

describe('load', () => {
  it('APBDes: GET dengan scopeId=apbdesId, page & limit; mengisi items/total/retensi', async () => {
    const { fetchImpl, deps } = setup({ lists: [halaman([item('d1'), item('d2')], 2)] });
    const state = createSampahPanelState({ sumber: 'dokumen-apbdes', scopeId: 'ap1' }, deps);

    await state.load(1);

    expect(calls(fetchImpl)).toEqual(['GET /api/sampah/dokumen-apbdes?scopeId=ap1&page=1&limit=20']);
    expect(state.items.map((i) => i.id)).toEqual(['d1', 'd2']);
    expect(state.total).toBe(2);
    expect(state.retensiHari).toBe(30);
    expect(state.loaded).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('foto BUMDes: tanpa scopeId', async () => {
    const { fetchImpl, deps } = setup({ lists: [halaman([])] });
    await createSampahPanelState({ sumber: 'foto-bumdes' }, deps).load(1);
    expect(calls(fetchImpl)).toEqual(['GET /api/sampah/foto-bumdes?page=1&limit=20']);
  });

  it('gagal memuat → pesan server di error, daftar tetap belum dimuat', async () => {
    const { deps } = setup({ lists: [json({ success: false, message: 'scopeId wajib' }, 400)] });
    const state = createSampahPanelState({ sumber: 'dokumen-perencanaan' }, deps);

    await state.load(1);

    expect(state.error).toBe('scopeId wajib');
    expect(state.loaded).toBe(false);
  });

  it('jaringan putus → pesan koneksi, status tidak menggantung loading', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const state = createSampahPanelState({ sumber: 'foto-bumdes' }, { fetchImpl: fetchImpl as unknown as typeof fetch });

    await state.load(1);

    expect(state.error).toMatch(/Tidak dapat terhubung/);
    expect(state.loading).toBe(false);
  });
});

describe('pulihkan', () => {
  it('POST /:id/pulihkan → toast pesan server, muat ulang, lalu callback induk', async () => {
    const { fetchImpl, notify, deps } = setup({
      lists: [halaman([item('d1'), item('d2')]), halaman([item('d2')])],
      aksi: json({ success: true, message: 'Dokumen dipulihkan' }),
    });
    const state = createSampahPanelState({ sumber: 'dokumen-apbdes', scopeId: 'ap1' }, deps);
    await state.load(1);
    const onPulihkan = vi.fn(() => expect(state.items.map((i) => i.id)).toEqual(['d2']));

    const ok = await state.pulihkan(state.items[0], onPulihkan);

    expect(ok).toBe(true);
    expect(calls(fetchImpl)).toEqual([
      'GET /api/sampah/dokumen-apbdes?scopeId=ap1&page=1&limit=20',
      'POST /api/sampah/dokumen-apbdes/d1/pulihkan',
      'GET /api/sampah/dokumen-apbdes?scopeId=ap1&page=1&limit=20',
    ]);
    expect(notify.success).toHaveBeenCalledWith('Dokumen dipulihkan');
    expect(onPulihkan).toHaveBeenCalledTimes(1);
    expect(state.busy).toBeNull();
  });

  it('gagal (404) → toast error, tanpa muat ulang & tanpa callback', async () => {
    const { fetchImpl, notify, deps } = setup({
      lists: [halaman([item('d1')])],
      aksi: json({ success: false, message: 'Item tidak ada di Sampah' }, 404),
    });
    const state = createSampahPanelState({ sumber: 'dokumen-perencanaan' }, deps);
    await state.load(1);
    const onPulihkan = vi.fn();

    expect(await state.pulihkan(state.items[0], onPulihkan)).toBe(false);

    expect(notify.error).toHaveBeenCalledWith('Item tidak ada di Sampah');
    expect(onPulihkan).not.toHaveBeenCalled();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('item terakhir di halaman 2 dipulihkan → muat halaman 1', async () => {
    const { fetchImpl, deps } = setup({ lists: [halaman([item('d21')], 21, 2), halaman([item('d1')], 20, 1)] });
    const state = createSampahPanelState({ sumber: 'foto-bumdes' }, deps);
    await state.load(2);

    await state.pulihkan(state.items[0]);

    expect(calls(fetchImpl).at(-1)).toBe('GET /api/sampah/foto-bumdes?page=1&limit=20');
    expect(state.page).toBe(1);
  });
});

describe('hapus permanen', () => {
  it('DELETE /:id untuk item terpilih → toast, tutup modal, muat ulang', async () => {
    const { fetchImpl, notify, deps } = setup({
      lists: [halaman([item('f1', { kategori: 'image' })]), halaman([])],
      aksi: json({ success: true, message: 'Foto dihapus permanen' }),
    });
    const state = createSampahPanelState({ sumber: 'foto-bumdes' }, deps);
    await state.load(1);
    state.pilihHapus(state.items[0]);

    expect(await state.hapusPermanen()).toBe(true);

    expect(calls(fetchImpl)).toEqual([
      'GET /api/sampah/foto-bumdes?page=1&limit=20',
      'DELETE /api/sampah/foto-bumdes/f1',
      'GET /api/sampah/foto-bumdes?page=1&limit=20',
    ]);
    expect(notify.success).toHaveBeenCalledWith('Foto dihapus permanen');
    expect(state.hapusTarget).toBeNull();
    expect(state.items).toEqual([]);
  });

  it('tanpa item terpilih tidak memanggil API', async () => {
    const { fetchImpl, deps } = setup({ lists: [] });
    const state = createSampahPanelState({ sumber: 'foto-bumdes' }, deps);
    expect(await state.hapusPermanen()).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('gagal → toast error dengan pesan server, daftar tidak dimuat ulang', async () => {
    const { fetchImpl, notify, deps } = setup({
      lists: [halaman([item('d1')])],
      aksi: json({ success: false, message: 'Tidak diizinkan' }, 403),
    });
    const state = createSampahPanelState({ sumber: 'dokumen-perencanaan' }, deps);
    await state.load(1);
    state.pilihHapus(state.items[0]);

    expect(await state.hapusPermanen()).toBe(false);

    expect(notify.error).toHaveBeenCalledWith('Tidak diizinkan');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(state.items.map((i) => i.id)).toEqual(['d1']);
  });
});
