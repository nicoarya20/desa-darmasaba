// @vitest-environment node
// Store Developer › Jenna › Log Error lewat fetch tiruan: URL yang dipanggil, ganti rentang, muat lebih banyak,
// galat, dan respons basi yang harus diabaikan.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import jennaErrorsState from '@/app/dev/_state/jenna-errors-state';
import { initialErrorLog } from '@/app/dev/jenna/log-error/log-error.logic';
import type { JennaErrorLogItem, JennaErrorLogResponse } from '@/lib/jenna/usage-types';

const item = (id: string): JennaErrorLogItem => ({
  id,
  conversationId: `conv-${id}`,
  createdAt: '2026-11-14T03:00:00.000Z',
  errorCode: 'provider_busy',
  errorDetail: 'HTTP 429: rate limited',
  providerSlot: 'chat_anthropic',
  model: 'model-a',
  latencyMs: 1200,
  preview: 'Jam buka kantor desa?',
  session: 'ab12cd34',
});

const ok = (data: JennaErrorLogResponse) =>
  new Response(JSON.stringify({ success: true, data }), { headers: { 'content-type': 'application/json' } });

function deferred() {
  let resolve!: (res: Response) => void;
  const promise = new Promise<Response>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const fetchMock = vi.fn<(url: string) => Promise<Response>>();
const calledUrls = () => fetchMock.mock.calls.map(([url]) => url);
const ids = () => jennaErrorsState.log.items?.map((i) => i.id) ?? null;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  jennaErrorsState.log = initialErrorLog();
  jennaErrorsState.selected = null;
  jennaErrorsState.detailOpen = false;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('load', () => {
  it('memuat 7 hari secara bawaan dan mengisi daftar', async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [item('1'), item('2')], nextCursor: '2', days: 7 }));
    await jennaErrorsState.load();
    expect(calledUrls()).toEqual(['/api/developer/jenna/errors?days=7']);
    expect(ids()).toEqual(['1', '2']);
    expect(jennaErrorsState.log).toMatchObject({ days: 7, nextCursor: '2', loading: false, error: null });
  });

  it('server gagal dihubungi → pesan galat, daftar tetap null', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await jennaErrorsState.load();
    expect(jennaErrorsState.log.items).toBeNull();
    expect(jennaErrorsState.log.loading).toBe(false);
    expect(jennaErrorsState.log.error).toBe('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
  });

  it('muat ulang gagal → daftar terakhir tetap ada', async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [item('1')], nextCursor: null, days: 7 }));
    await jennaErrorsState.load();
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await jennaErrorsState.load();
    expect(ids()).toEqual(['1']);
    expect(jennaErrorsState.log.error).not.toBeNull();
  });
});

describe('setDays', () => {
  it('rentang baru → daftar dikosongkan lalu dimuat dengan days baru', async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [item('1')], nextCursor: '1', days: 7 }));
    await jennaErrorsState.load();

    const pending = deferred();
    fetchMock.mockReturnValueOnce(pending.promise);
    jennaErrorsState.setDays(30);
    expect(jennaErrorsState.log).toMatchObject({ days: 30, items: null, nextCursor: null, loading: true });

    pending.resolve(ok({ items: [item('8')], nextCursor: null, days: 30 }));
    await vi.waitFor(() => expect(jennaErrorsState.log.loading).toBe(false));
    expect(calledUrls()).toEqual(['/api/developer/jenna/errors?days=7', '/api/developer/jenna/errors?days=30']);
    expect(ids()).toEqual(['8']);
  });

  it('rentang yang sama tidak memicu permintaan', () => {
    jennaErrorsState.setDays(7);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('respons rentang lama yang datang terlambat diabaikan', async () => {
    const slow = deferred();
    fetchMock.mockReturnValueOnce(slow.promise);
    const first = jennaErrorsState.load(7);

    fetchMock.mockResolvedValueOnce(ok({ items: [item('30')], nextCursor: null, days: 30 }));
    await jennaErrorsState.load(30);

    slow.resolve(ok({ items: [item('7')], nextCursor: '7', days: 7 }));
    await first;
    expect(jennaErrorsState.log.days).toBe(30);
    expect(ids()).toEqual(['30']);
    expect(jennaErrorsState.log.nextCursor).toBeNull();
  });
});

describe('loadMore', () => {
  it('mengirim cursor dan menambahkan hasil di akhir daftar', async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [item('1'), item('2')], nextCursor: '2', days: 7 }));
    await jennaErrorsState.load();
    fetchMock.mockResolvedValueOnce(ok({ items: [item('3')], nextCursor: null, days: 7 }));
    await jennaErrorsState.loadMore();
    expect(calledUrls()[1]).toBe('/api/developer/jenna/errors?days=7&cursor=2');
    expect(ids()).toEqual(['1', '2', '3']);
    expect(jennaErrorsState.log).toMatchObject({ nextCursor: null, loadingMore: false, moreError: null });
  });

  it('tanpa kursor tidak memicu permintaan', async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [item('1')], nextCursor: null, days: 7 }));
    await jennaErrorsState.load();
    await jennaErrorsState.loadMore();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gagal → daftar dan kursor tetap, lalu bisa dicoba lagi', async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [item('1')], nextCursor: '1', days: 7 }));
    await jennaErrorsState.load();
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
    await jennaErrorsState.loadMore();
    expect(ids()).toEqual(['1']);
    expect(jennaErrorsState.log).toMatchObject({ nextCursor: '1', loadingMore: false });
    expect(jennaErrorsState.log.moreError).toBe('Tidak dapat terhubung ke server. Periksa koneksi Anda.');

    fetchMock.mockResolvedValueOnce(ok({ items: [item('2')], nextCursor: null, days: 7 }));
    await jennaErrorsState.loadMore();
    expect(ids()).toEqual(['1', '2']);
    expect(jennaErrorsState.log.moreError).toBeNull();
  });

  it('halaman lanjutan yang tiba setelah rentang diganti tidak dicampur ke daftar baru', async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [item('1')], nextCursor: '1', days: 7 }));
    await jennaErrorsState.load();

    const slow = deferred();
    fetchMock.mockReturnValueOnce(slow.promise);
    const more = jennaErrorsState.loadMore();

    fetchMock.mockResolvedValueOnce(ok({ items: [item('30')], nextCursor: null, days: 30 }));
    await jennaErrorsState.load(30);

    slow.resolve(ok({ items: [item('2')], nextCursor: null, days: 7 }));
    await more;
    expect(ids()).toEqual(['30']);
    expect(jennaErrorsState.log).toMatchObject({ days: 30, loadingMore: false, loading: false });
  });
});

describe('drawer rincian', () => {
  it('openDetail menyimpan giliran; closeDetail menutup tanpa mengosongkan isinya', () => {
    jennaErrorsState.openDetail(item('1'));
    expect(jennaErrorsState.detailOpen).toBe(true);
    expect(jennaErrorsState.selected?.id).toBe('1');
    jennaErrorsState.closeDetail();
    expect(jennaErrorsState.detailOpen).toBe(false);
    expect(jennaErrorsState.selected?.id).toBe('1');
  });
});
