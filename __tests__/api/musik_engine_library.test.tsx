// @vitest-environment node
// Muat pustaka Musik Desa: gagal (HTTP, success:false, jaringan) → loadError, dan "Coba lagi" lewat loadMusikData().
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicProvider, useMusic } from '@/app/context/MusicContext';
import { flush, installBrowserStubs, libraryReply, mount, run, song, type FetchReply } from './_musik_engine_harness';

vi.mock('react-toastify', () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

let music: ReturnType<typeof useMusic>;
function Probe() {
  music = useMusic();
  return null;
}

async function start(replies: FetchReply[]) {
  const stubs = installBrowserStubs(replies);
  await mount(
    <MusicProvider>
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

    let resolve: (value: unknown) => void = () => {};
    fetchMock.mockImplementationOnce(() => new Promise((r) => (resolve = r)));
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
