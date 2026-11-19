// @vitest-environment node
// Muat pustaka Musik Desa: gagal (HTTP, success:false, jaringan) → loadError, "Coba lagi" lewat loadMusikData(),
// dan pustaka hanya dimuat bila diminta (ensureMusikData) karena provider ada di root layout (setiap halaman).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicProvider, useMusic } from '@/app/context/MusicContext';
import {
  flush,
  installBrowserStubs,
  libraryReply,
  mount,
  RequestLibrary,
  run,
  song,
  type FetchReply,
} from './_musik_engine_harness';

vi.mock('react-toastify', () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

let music: ReturnType<typeof useMusic>;
function Probe() {
  music = useMusic();
  return null;
}

/** `request` false = halaman selain Musik (tidak ada yang meminta pustaka). */
async function start(replies: FetchReply[], { request = true } = {}) {
  const stubs = installBrowserStubs(replies);
  await mount(
    <MusicProvider>
      {request ? <RequestLibrary /> : null}
      <Probe />
    </MusicProvider>
  );
  return stubs;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('muat pustaka', () => {
  it('sukses: hanya lagu aktif, tanpa loadError', async () => {
    await start([libraryReply([song('a'), song('b', { isActive: false })])]);
    expect(music.isLoading).toBe(false);
    expect(music.loadError).toBe(false);
    expect(music.musikData.map((s) => s.id)).toEqual(['a']);
  });

  it.each([
    ['HTTP 500', { status: 500, body: { success: false } }, 'HTTP 500'],
    ['success:false', { body: { success: false, message: 'db down' } }, 'success:false'],
    ['jaringan putus', new TypeError('Failed to fetch'), 'jaringan/JSON: TypeError'],
  ] as const)('%s → loadError true, isLoading false, log berkonteks tanpa isi respons', async (_name, reply, logPart) => {
    await start([reply]);
    expect(music.loadError).toBe(true);
    expect(music.isLoading).toBe(false);
    expect(music.musikData).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining(logPart));
    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('db down'));
  });

  it('coba lagi: isLoading true & loadError false selama memuat, lalu data tampil', async () => {
    const { fetchMock } = await start([{ status: 503 }]);
    expect(music.loadError).toBe(true);

    type Reply = { ok: boolean; status: number; json: () => Promise<unknown> };
    let resolve: (value: Reply) => void = () => {};
    fetchMock.mockImplementationOnce(() => new Promise<Reply>((r) => (resolve = r)));
    await run(() => {
      void music.loadMusikData();
    });
    expect(music.isLoading).toBe(true);
    expect(music.loadError).toBe(false);

    resolve({ ok: true, status: 200, json: async () => (libraryReply([song('x')]) as { body: unknown }).body });
    await flush();
    expect(music.isLoading).toBe(false);
    expect(music.loadError).toBe(false);
    expect(music.musikData.map((s) => s.id)).toEqual(['x']);
  });
});

describe('muat pustaka sesuai permintaan', () => {
  it('tanpa permintaan (halaman selain Musik): tidak ada fetch, pustaka kosong, isLoading tetap true', async () => {
    const { fetchMock } = await start([libraryReply([song('a')])], { request: false });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(music.musikData).toEqual([]);
    expect(music.isLoading).toBe(true);
    expect(music.loadError).toBe(false);
  });

  it('ensureMusikData pertama memuat pustaka (endpoint & limit sama seperti dulu)', async () => {
    const { fetchMock } = await start([libraryReply([song('a')])], { request: false });
    await run(() => music.ensureMusikData());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/desa/musik/find-many?page=1&limit=50');
    expect(music.isLoading).toBe(false);
    expect(music.musikData.map((s) => s.id)).toEqual(['a']);
  });

  it('ensureMusikData berulang (pindah menu Musik, pasang ulang) tidak fetch ulang', async () => {
    const { fetchMock } = await start([libraryReply([song('a')])]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await run(() => music.ensureMusikData());
    await run(() => music.ensureMusikData());
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('setelah gagal, ensureMusikData tidak mencoba sendiri; "Coba lagi" (loadMusikData) tetap memuat ulang', async () => {
    const { fetchMock } = await start([{ status: 503 }, libraryReply([song('x')])]);
    expect(music.loadError).toBe(true);
    await run(() => music.ensureMusikData());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await run(() => {
      void music.loadMusikData();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(music.musikData.map((s) => s.id)).toEqual(['x']);
  });
});
