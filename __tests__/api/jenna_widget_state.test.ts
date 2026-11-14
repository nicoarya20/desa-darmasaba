// @vitest-environment node
// Store widget Jenna: alur SSE lewat fetch tiruan (delta → done mengganti teks, event error, error JSON pra-stream, abort)
// dan sessionStorage yang gagal tidak mematahkan percakapan.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import jennaState, { ABORTED_CODE, STORAGE_KEY } from '@/app/(public)/_com/jenna/jenna.state';

const enc = new TextEncoder();
const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

function sseResponse(chunks: string[]) {
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      for (const chunk of chunks) c.enqueue(enc.encode(chunk));
      c.close();
    },
  });
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
}

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    map,
  };
}

const throwingStorage = {
  getItem: () => {
    throw new DOMException('blocked', 'SecurityError');
  },
  setItem: () => {
    throw new DOMException('quota', 'QuotaExceededError');
  },
  removeItem: () => {
    throw new DOMException('blocked', 'SecurityError');
  },
};

const statusResponse = () =>
  new Response(JSON.stringify({ enabled: true, assistantName: 'Jenna', maxInputChars: 500 }), {
    headers: { 'content-type': 'application/json' },
  });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('sessionStorage', memoryStorage());
  jennaState.reset();
  jennaState.status = 'enabled';
  jennaState.maxInputChars = 500;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const assistant = () => jennaState.messages[jennaState.messages.length - 1];

describe('jennaState.send — SSE', () => {
  it('delta di-stream lalu diganti teks final dari done; conversationId & sumber disimpan', async () => {
    fetchMock.mockResolvedValueOnce(
      sseResponse([
        sse('meta', { conversationId: 'c1', requestId: 'r1' }),
        ': ping\n\n',
        sse('status', { text: 'Mencari informasi…' }),
        sse('delta', { text: 'Kantor buka ' }),
        sse('delta', { text: 'jam 8' }),
        sse('done', { conversationId: 'c1', text: 'Kantor desa buka **08.00–15.00**.', sources: [{ title: 'Profil', url: '/pemerintahan/profil' }] }),
      ]),
    );
    const turn = jennaState.send('  Jam buka kantor?  ', {
      pageContext: { route: '/', title: 'Beranda' },
      website: '',
    });
    expect(jennaState.sending).toBe(true);
    await turn;

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/jenna/chat');
    expect(JSON.parse(init.body)).toEqual({
      message: 'Jam buka kantor?',
      pageContext: { route: '/', title: 'Beranda' },
      website: '',
    });
    expect(jennaState.messages.map((m) => [m.role, m.status])).toEqual([
      ['user', 'done'],
      ['assistant', 'done'],
    ]);
    expect(assistant().text).toBe('Kantor desa buka **08.00–15.00**.');
    expect(assistant().sources).toEqual([{ title: 'Profil', url: '/pemerintahan/profil' }]);
    expect(jennaState.conversationId).toBe('c1');
    expect(jennaState.sending).toBe(false);
    expect(jennaState.statusText).toBeNull();
  });

  it('giliran berikutnya mengirim conversationId dan nilai honeypot', async () => {
    fetchMock.mockResolvedValueOnce(sseResponse([sse('done', { conversationId: 'c9', text: 'a', sources: [] })]));
    await jennaState.send('satu');
    fetchMock.mockResolvedValueOnce(sseResponse([sse('done', { conversationId: 'c9', text: 'b', sources: [] })]));
    await jennaState.send('dua', { website: 'http://spam' });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ conversationId: 'c9', website: 'http://spam' });
  });

  it('event error di tengah stream → pesan error Indonesia + kode + retryAt', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    fetchMock.mockResolvedValueOnce(
      sseResponse([sse('delta', { text: 'sebagian' }), sse('error', { code: 'busy', message: 'Jenna sedang sibuk.', retryAfterSec: 5 })]),
    );
    await jennaState.send('halo');
    expect(assistant()).toMatchObject({ status: 'error', errorCode: 'busy', text: 'Jenna sedang sibuk.', retryAt: 1_005_000 });
    expect(jennaState.error).toEqual({ code: 'busy', message: 'Jenna sedang sibuk.', retryAfterSec: 5 });
  });

  it('error JSON pra-stream (429) memakai message server dan Retry-After', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, code: 'rate_limited', message: 'Terlalu banyak pertanyaan.' }), {
        status: 429,
        headers: { 'content-type': 'application/json', 'retry-after': '30' },
      }),
    );
    await jennaState.send('halo');
    expect(assistant()).toMatchObject({ status: 'error', errorCode: 'rate_limited', text: 'Terlalu banyak pertanyaan.' });
    expect(jennaState.error?.retryAfterSec).toBe(30);
  });

  it('stream berakhir tanpa done → koneksi terputus (network, bisa dikirim ulang)', async () => {
    fetchMock.mockResolvedValueOnce(sseResponse([sse('delta', { text: 'putus' })]));
    await jennaState.send('halo');
    expect(assistant()).toMatchObject({ status: 'error', errorCode: 'network' });
    expect(assistant().text).toMatch(/Koneksi terputus/);
  });

  it('abort menghentikan giliran: teks parsial dipertahankan, status aborted', async () => {
    let streamController!: ReadableStreamDefaultController<Uint8Array>;
    fetchMock.mockImplementationOnce((_url: string, init: RequestInit) => {
      const body = new ReadableStream<Uint8Array>({
        start(c) {
          streamController = c;
          c.enqueue(enc.encode(sse('delta', { text: 'Sebagian jawaban' })));
        },
      });
      init.signal?.addEventListener('abort', () => streamController.error(new DOMException('Aborted', 'AbortError')));
      return Promise.resolve(new Response(body, { headers: { 'content-type': 'text/event-stream' } }));
    });
    const turn = jennaState.send('halo');
    await vi.waitFor(() => expect(assistant().text).toBe('Sebagian jawaban'));
    jennaState.abort();
    await turn;
    expect(assistant()).toMatchObject({ status: 'error', errorCode: ABORTED_CODE, text: 'Sebagian jawaban' });
    expect(jennaState.sending).toBe(false);
    expect(jennaState.error).toBeNull();
  });

  it('retry membuang pasangan gagal lalu mengirim ulang pertanyaan yang sama', async () => {
    fetchMock.mockResolvedValueOnce(sseResponse([sse('error', { code: 'provider_error', message: 'Gagal.' })]));
    await jennaState.send('ulang aku');
    fetchMock.mockResolvedValueOnce(sseResponse([sse('done', { conversationId: 'c2', text: 'Berhasil', sources: [] })]));
    await jennaState.retry();
    expect(jennaState.messages.map((m) => m.text)).toEqual(['ulang aku', 'Berhasil']);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).message).toBe('ulang aku');
  });

  it('retry diabaikan untuk kode yang tidak bisa dikirim ulang', async () => {
    fetchMock.mockResolvedValueOnce(sseResponse([sse('error', { code: 'invalid_input', message: 'Terlalu panjang.' })]));
    await jennaState.send('x');
    await jennaState.retry();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('tidak mengirim saat widget belum enabled atau pesan kosong', async () => {
    await jennaState.send('   ');
    jennaState.status = 'disabled';
    await jennaState.send('halo');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('persistensi sessionStorage', () => {
  it('menyimpan conversationId + maks 30 pesan dan memulihkannya saat loadStatus', async () => {
    const storage = memoryStorage();
    vi.stubGlobal('sessionStorage', storage);
    for (let i = 0; i < 16; i++) {
      fetchMock.mockResolvedValueOnce(sseResponse([sse('done', { conversationId: 'c3', text: `jawab ${i}`, sources: [] })]));
      await jennaState.send(`tanya ${i}`);
    }
    const saved = JSON.parse(storage.map.get(STORAGE_KEY)!);
    expect(saved.conversationId).toBe('c3');
    expect(saved.messages).toHaveLength(30);
    expect(saved.messages.at(-1).text).toBe('jawab 15');

    jennaState.messages = [];
    jennaState.conversationId = null;
    jennaState.status = 'loading';
    fetchMock.mockResolvedValueOnce(statusResponse());
    await jennaState.loadStatus();
    expect(jennaState.status).toBe('enabled');
    expect(jennaState.conversationId).toBe('c3');
    expect(jennaState.messages).toHaveLength(30);

    jennaState.reset();
    expect(storage.map.has(STORAGE_KEY)).toBe(false);
  });

  it('sessionStorage yang melempar error tidak mematahkan status, kirim, maupun reset', async () => {
    vi.stubGlobal('sessionStorage', throwingStorage);
    jennaState.status = 'loading';
    fetchMock.mockResolvedValueOnce(statusResponse());
    await jennaState.loadStatus();
    expect(jennaState.status).toBe('enabled');

    fetchMock.mockResolvedValueOnce(sseResponse([sse('done', { conversationId: 'c4', text: 'ok', sources: [] })]));
    await jennaState.send('halo');
    expect(assistant()).toMatchObject({ status: 'done', text: 'ok' });
    expect(() => jennaState.reset()).not.toThrow();
  });

  it('isi sessionStorage rusak diabaikan', async () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{bukan json');
    vi.stubGlobal('sessionStorage', storage);
    jennaState.status = 'loading';
    fetchMock.mockResolvedValueOnce(statusResponse());
    await jennaState.loadStatus();
    expect(jennaState.messages).toEqual([]);
  });
});

describe('jennaState.loadStatus', () => {
  it('status gagal / nonaktif → disabled (widget tidak dirender)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    jennaState.status = 'loading';
    fetchMock.mockResolvedValueOnce(new Response('x', { status: 500 }));
    await jennaState.loadStatus();
    expect(jennaState.status).toBe('disabled');

    jennaState.status = 'loading';
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ enabled: false, assistantName: 'Jenna', maxInputChars: 500 })));
    await jennaState.loadStatus();
    expect(jennaState.status).toBe('disabled');
  });
});
