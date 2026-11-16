// @vitest-environment node
// Store mode suara widget (window/document/localStorage tiruan; controller WebRTC ditiru): persetujuan + localStorage, heartbeat & stop
// dari server, galat sesaat, pagehide/tersembunyi, idle, galat start; serta jennaState.askVoice.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VoiceControllerOptions } from '@/app/(public)/_com/jenna/voice/voice-controller';

const ctl = vi.hoisted(() => ({
  opts: null as VoiceControllerOptions | null,
  stop: vi.fn(),
  impl: null as null | ((opts: VoiceControllerOptions) => Promise<{ stop: () => void }>),
}));

vi.mock('@/app/(public)/_com/jenna/voice/voice-controller', () => ({
  createVoiceController: vi.fn((opts: VoiceControllerOptions) => {
    ctl.opts = opts;
    return ctl.impl!(opts);
  }),
}));

import jennaState from '@/app/(public)/_com/jenna/jenna.state';
import { JennaChatError } from '@/app/(public)/_com/jenna/jenna.api';
import voiceState, { bindVoiceContext, VOICE_CONSENT_KEY, VOICE_HIDDEN_CLOSE_MS } from '@/app/(public)/_com/jenna/jenna-voice.state';
import { createVoiceController } from '@/app/(public)/_com/jenna/voice/voice-controller';
import { VOICE_COPY } from '@/app/(public)/_com/jenna/voice/voice-copy';

const SESSION_ID = 'abcdefghij0123456789ab';
const START = { sessionId: SESSION_ID, sdp: 'v=0', maxSeconds: 300, idleOffSeconds: 60, remainingTodaySeconds: 900 };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const beat = (over: Record<string, unknown> = {}) =>
  json({ elapsedSeconds: 15, maxSeconds: 300, remainingTodaySeconds: 885, stop: null, ...over });

let fetchMock: ReturnType<typeof vi.fn>;
let win: EventTarget;
let doc: EventTarget & { visibilityState: DocumentVisibilityState };
let storage: Map<string, string>;
let storageBlocked = false;
const localStorageStub = {
  getItem: (k: string) => {
    if (storageBlocked) throw new DOMException('blocked', 'SecurityError');
    return storage.get(k) ?? null;
  },
  setItem: (k: string, v: string) => {
    if (storageBlocked) throw new DOMException('blocked', 'SecurityError');
    storage.set(k, v);
  },
};
const calls = (suffix: string) => fetchMock.mock.calls.filter(([url]) => String(url).endsWith(suffix));
const closeBody = () => JSON.parse(calls('/close')[0][1].body) as { reason: string };

function startedController(start = START) {
  ctl.impl = async (opts) => {
    await Promise.resolve(); // getUserMedia selalu asinkron
    opts.events.session(start);
    opts.events.status('ready');
    return { stop: ctl.stop };
  };
}

async function startSession() {
  voiceState.requestStart();
  await vi.advanceTimersByTimeAsync(0);
}

beforeEach(() => {
  vi.useFakeTimers();
  fetchMock = vi.fn().mockImplementation(async (url: string) => (String(url).endsWith('/close') ? json({ billedSeconds: 1 }) : beat()));
  vi.stubGlobal('fetch', fetchMock);
  win = new EventTarget();
  doc = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState });
  storage = new Map([[VOICE_CONSENT_KEY, '1']]);
  storageBlocked = false;
  vi.stubGlobal('window', win);
  vi.stubGlobal('document', doc);
  vi.stubGlobal('localStorage', localStorageStub);
  ctl.stop.mockReset();
  vi.mocked(createVoiceController).mockClear();
  startedController();
  bindVoiceContext(() => ({ pageContext: { route: '/', title: 'Beranda' }, website: '' }));
});

afterEach(() => {
  voiceState.shutdown();
  voiceState.dismissNotice();
  bindVoiceContext(null);
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('persetujuan', () => {
  it('belum pernah setuju → dialog dulu; setuju disimpan lalu langsung mulai', async () => {
    storage.clear();
    voiceState.requestStart();
    expect(voiceState.consentOpen).toBe(true);
    expect(createVoiceController).not.toHaveBeenCalled();

    voiceState.acceptConsent();
    expect(voiceState.status).toBe('connecting');
    expect(storage.get(VOICE_CONSENT_KEY)).toBe('1');
    await vi.advanceTimersByTimeAsync(0);
    expect(voiceState.status).toBe('ready');
    expect(voiceState.sessionId).toBe(SESSION_ID);
  });

  it('batal menutup dialog tanpa memulai', () => {
    storage.clear();
    voiceState.requestStart();
    voiceState.declineConsent();
    expect(voiceState.consentOpen).toBe(false);
    expect(voiceState.status).toBe('off');
  });

  it('localStorage diblokir: tetap bisa setuju dan mulai', async () => {
    storageBlocked = true;
    voiceState.requestStart();
    expect(voiceState.consentOpen).toBe(true);
    expect(() => voiceState.acceptConsent()).not.toThrow();
    await vi.advanceTimersByTimeAsync(0);
    expect(voiceState.status).toBe('ready');
  });
});

describe('sesi berjalan', () => {
  it('heartbeat tiap 15 detik memperbarui sisa waktu', async () => {
    await startSession();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(calls('/heartbeat')).toHaveLength(1);
    expect(voiceState.beat).toEqual({ elapsedSeconds: 15, maxSeconds: 300, remainingTodaySeconds: 885 });
  });

  it('heartbeat stop dari server → sesi berakhir tanpa close dari klien', async () => {
    fetchMock.mockImplementation(async () => beat({ stop: 'quota' }));
    await startSession();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(voiceState.status).toBe('off');
    expect(voiceState.notice).toBe(VOICE_COPY.ended.quota);
    expect(ctl.stop).toHaveBeenCalledOnce();
    expect(calls('/close')).toHaveLength(0);
  });

  it('galat jaringan sesaat ditoleransi; 3x berturut-turut → diakhiri dengan close "error"', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).endsWith('/close')) return json({ billedSeconds: 1 });
      throw new TypeError('Failed to fetch');
    });
    await startSession();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(voiceState.status).toBe('ready');
    await vi.advanceTimersByTimeAsync(15_000);
    expect(voiceState.status).toBe('off');
    expect(voiceState.notice).toBe(VOICE_COPY.errors.connectionLost);
    expect(closeBody().reason).toBe('error');
  });

  it('heartbeat 409 → pesan server tampil apa adanya', async () => {
    fetchMock.mockImplementation(async () =>
      json({ success: false, code: 'VOICE_SESSION_ENDED', message: 'Sesi suara sudah berakhir.' }, 409),
    );
    await startSession();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(voiceState.status).toBe('off');
    expect(voiceState.notice).toBe('Sesi suara sudah berakhir.');
    expect(calls('/close')).toHaveLength(0);
  });

  it('Akhiri → close "user" dengan keepalive, mic & peer dilepas', async () => {
    await startSession();
    voiceState.stop();
    expect(voiceState.status).toBe('off');
    expect(ctl.stop).toHaveBeenCalledOnce();
    expect(closeBody().reason).toBe('user');
    expect(calls('/close')[0][1]).toMatchObject({ keepalive: true });
  });

  it('pagehide → close "pagehide"', async () => {
    await startSession();
    win.dispatchEvent(new Event('pagehide'));
    expect(voiceState.status).toBe('off');
    expect(closeBody().reason).toBe('pagehide');
  });

  it('halaman tersembunyi lama → diakhiri; kembali cepat → tetap jalan', async () => {
    startedController({ ...START, idleOffSeconds: 600 });
    await startSession();
    const setVisibility = (v: DocumentVisibilityState) => {
      doc.visibilityState = v;
      doc.dispatchEvent(new Event('visibilitychange'));
    };

    setVisibility('hidden');
    await vi.advanceTimersByTimeAsync(5_000);
    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(VOICE_HIDDEN_CLOSE_MS);
    expect(voiceState.status).toBe('ready');

    setVisibility('hidden');
    await vi.advanceTimersByTimeAsync(VOICE_HIDDEN_CLOSE_MS);
    expect(voiceState.status).toBe('off');
    expect(voiceState.notice).toBe(VOICE_COPY.ended.hidden);
    expect(closeBody().reason).toBe('pagehide');
  });

  it('hening selama idleOffSeconds → close "idle"', async () => {
    await startSession();
    await vi.advanceTimersByTimeAsync(59_000);
    expect(voiceState.status).toBe('ready');
    await vi.advanceTimersByTimeAsync(2_000);
    expect(voiceState.status).toBe('off');
    expect(voiceState.notice).toBe(VOICE_COPY.ended.idle);
    expect(closeBody().reason).toBe('idle');
  });

  it('chat menolak voice_session_ended → sesi suara ikut diakhiri', async () => {
    await startSession();
    vi.spyOn(jennaState, 'askVoice').mockRejectedValue(new JennaChatError('voice_session_ended', 'Sesi suara sudah berakhir.'));
    await expect(ctl.opts!.events.ask('halo', {}, new AbortController().signal)).rejects.toThrow(JennaChatError);
    expect(voiceState.status).toBe('off');
    expect(voiceState.notice).toBe('Sesi suara sudah berakhir.');
    expect(calls('/close')).toHaveLength(0);
  });
});

describe('gagal memulai', () => {
  it('izin mikrofon ditolak → pesan ramah, tidak ada sesi server', async () => {
    ctl.impl = async () => {
      throw new DOMException('denied', 'NotAllowedError');
    };
    await startSession();
    expect(voiceState.status).toBe('off');
    expect(voiceState.notice).toBe(VOICE_COPY.errors.micDenied);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sesi server dibuat tapi WebRTC gagal → close "error"', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    ctl.impl = async (opts) => {
      opts.events.session(START);
      throw new Error('ice failed');
    };
    await startSession();
    expect(voiceState.status).toBe('off');
    expect(voiceState.notice).toBe(VOICE_COPY.errors.failed);
    expect(closeBody().reason).toBe('error');
  });

  it('diakhiri selagi menyambung → controller dihentikan dan sesi ditutup "user"', async () => {
    let resolve!: () => void;
    ctl.impl = (opts) =>
      new Promise((r) => {
        resolve = () => {
          opts.events.session(START);
          r({ stop: ctl.stop });
        };
      });
    voiceState.requestStart();
    voiceState.stop();
    expect(voiceState.status).toBe('off');
    resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(ctl.stop).toHaveBeenCalledOnce();
    expect(closeBody().reason).toBe('user');
    expect(voiceState.status).toBe('off');
  });
});

describe('jennaState.askVoice', () => {
  const enc = new TextEncoder();
  const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const sseResponse = (chunks: string[]) =>
    new Response(
      new ReadableStream<Uint8Array>({
        start(c) {
          for (const chunk of chunks) c.enqueue(enc.encode(chunk));
          c.close();
        },
      }),
      { status: 200, headers: { 'content-type': 'text/event-stream' } },
    );

  beforeEach(() => {
    vi.useRealTimers();
    jennaState.reset();
    jennaState.status = 'enabled';
  });

  it('body membawa modality & voiceSessionId; pesan ditandai suara; delta diteruskan', async () => {
    fetchMock.mockResolvedValueOnce(sseResponse([sse('delta', { text: 'Buka ' }), sse('done', { conversationId: 'c1', text: 'Buka jam 8.', sources: [] })]));
    const deltas: string[] = [];
    const out = await jennaState.askVoice('jam buka?', { pageContext: { route: '/', title: 'B' } }, {
      voiceSessionId: SESSION_ID,
      signal: new AbortController().signal,
      onDelta: (t) => deltas.push(t),
    });
    expect(out).toBe('Buka jam 8.');
    expect(deltas).toEqual(['Buka ']);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ message: 'jam buka?', modality: 'voice', voiceSessionId: SESSION_ID });
    expect(jennaState.messages[0]).toMatchObject({ role: 'user', modality: 'voice' });
  });

  it('dibatalkan (barge-in) → AbortError', async () => {
    const ac = new AbortController();
    ac.abort();
    await expect(jennaState.askVoice('halo', {}, { voiceSessionId: SESSION_ID, signal: ac.signal })).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ucapan baru menggantikan giliran yang masih berjalan', async () => {
    fetchMock
      .mockImplementationOnce((_url: string, init: RequestInit) =>
        new Promise((_, reject) => init.signal!.addEventListener('abort', () => reject(new DOMException('a', 'AbortError')))),
      )
      .mockResolvedValueOnce(sseResponse([sse('done', { conversationId: 'c1', text: 'Jawaban kedua.', sources: [] })]));
    const turn = { voiceSessionId: SESSION_ID, signal: new AbortController().signal };
    const first = jennaState.askVoice('pertama', {}, turn);
    const second = jennaState.askVoice('kedua', {}, turn);
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await expect(second).resolves.toBe('Jawaban kedua.');
    expect(jennaState.sending).toBe(false);
  });

  it('galat chat diteruskan sebagai JennaChatError', async () => {
    fetchMock.mockResolvedValueOnce(sseResponse([sse('error', { code: 'voice_session_ended', message: 'Sesi suara sudah berakhir.' })]));
    await expect(jennaState.askVoice('halo', {}, { voiceSessionId: SESSION_ID, signal: new AbortController().signal })).rejects.toMatchObject({
      code: 'voice_session_ended',
    });
  });
});
