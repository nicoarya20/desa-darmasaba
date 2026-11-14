// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createDeadline, DeadlineExceededError, raceWithSignal } from '@/lib/jenna/runtime/deadline';
import { createSseResponse, formatSseEvent, SSE_GENERIC_ERROR, SSE_HEADERS } from '@/lib/jenna/runtime/sse';
import { createSseParser, readSseStream, type SseEvent } from '@/lib/jenna/runtime/sse-parser';

const streamOf = (...chunks: string[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      for (const ch of chunks) c.enqueue(new TextEncoder().encode(ch));
      c.close();
    },
  });

describe('deadline', () => {
  it('abort dengan DeadlineExceededError setelah timeout', async () => {
    const d = createDeadline(10);
    await new Promise((r) => setTimeout(r, 30));
    expect(d.signal.aborted).toBe(true);
    expect(d.signal.reason).toBeInstanceOf(DeadlineExceededError);
    expect((d.signal.reason as DeadlineExceededError).timeoutMs).toBe(10);
    d.dispose();
  });

  it('parent abort diteruskan (termasuk yang sudah abort); dispose menghentikan timer', async () => {
    const parent = new AbortController();
    const d = createDeadline(10_000, parent.signal);
    parent.abort('stop');
    expect(d.signal.aborted).toBe(true);
    expect(d.signal.reason).toBe('stop');
    d.dispose();

    const pre = new AbortController();
    pre.abort('awal');
    expect(createDeadline(10_000, pre.signal).signal.reason).toBe('awal');

    const disposed = createDeadline(10);
    disposed.dispose();
    await new Promise((r) => setTimeout(r, 30));
    expect(disposed.signal.aborted).toBe(false);
  });

  it('raceWithSignal: selesai normal, menolak saat abort, langsung menolak bila sudah abort', async () => {
    const ac = new AbortController();
    await expect(raceWithSignal(Promise.resolve(1), ac.signal)).resolves.toBe(1);
    await expect(raceWithSignal(Promise.reject(new Error('x')), ac.signal)).rejects.toThrow('x');

    const hanging = raceWithSignal(new Promise(() => {}), ac.signal);
    ac.abort(new DeadlineExceededError(5));
    await expect(hanging).rejects.toBeInstanceOf(DeadlineExceededError);
    await expect(raceWithSignal(Promise.resolve(1), ac.signal)).rejects.toBeInstanceOf(DeadlineExceededError);
  });
});

describe('createSseParser', () => {
  const collect = (chunks: string[], end = true) => {
    const events: SseEvent[] = [];
    const p = createSseParser((e) => events.push(e));
    for (const c of chunks) p.push(c);
    if (end) p.end();
    return events;
  };

  it('event bernama, default "message", data multi-baris, komentar diabaikan', () => {
    expect(collect([': ping\n\nevent: delta\ndata: {"t":"a"}\n\ndata: x\ndata: y\n\n'])).toEqual([
      { event: 'delta', data: '{"t":"a"}' },
      { event: 'message', data: 'x\ny' },
    ]);
  });

  it('event terpotong di batas chunk dan CRLF terbelah tetap utuh', () => {
    expect(collect(['eve', 'nt: done\r', '\ndata: {"o', 'k":1}\r\n', '\r\n'])).toEqual([
      { event: 'done', data: '{"ok":1}' },
    ]);
  });

  it('CR saja sebagai pemisah baris', () => {
    expect(collect(['data: a\r\rdata: b\r\r'])).toEqual([
      { event: 'message', data: 'a' },
      { event: 'message', data: 'b' },
    ]);
  });

  it('end() mengirim event terakhir tanpa baris kosong; tanpa end tidak dikirim', () => {
    expect(collect(['data: akhir'], false)).toEqual([]);
    expect(collect(['data: akhir'])).toEqual([{ event: 'message', data: 'akhir' }]);
  });

  it('readSseStream membaca stream byte (UTF-8 terbelah)', async () => {
    const bytes = new TextEncoder().encode('data: héllo\n\n');
    const split = 7; // di tengah karakter "é"
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(bytes.slice(0, split));
        c.enqueue(bytes.slice(split));
        c.close();
      },
    });
    const events: SseEvent[] = [];
    await readSseStream(body, (e) => events.push(e));
    expect(events).toEqual([{ event: 'message', data: 'héllo' }]);
    await readSseStream(streamOf(''), (e) => events.push(e));
    expect(events).toHaveLength(1);
  });
});

describe('createSseResponse', () => {
  it('header SSE, ": open" dulu, event terformat, lalu ditutup', async () => {
    const res = createSseResponse(async (send) => {
      send('meta', { id: 'c1' });
      send('done', {});
    });
    for (const [k, v] of Object.entries(SSE_HEADERS)) expect(res.headers.get(k)).toBe(v);
    const text = await res.text();
    expect(text).toBe(': open\n\n' + formatSseEvent('meta', { id: 'c1' }) + formatSseEvent('done', {}));
  });

  it('run melempar → satu event error generik, detail tidak bocor', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = createSseResponse(async () => {
      throw new Error('rahasia sk-123');
    });
    const events: SseEvent[] = [];
    await readSseStream(res.body!, (e) => events.push(e));
    expect(events).toEqual([{ event: 'error', data: JSON.stringify(SSE_GENERIC_ERROR) }]);
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it('ping berkala sebagai komentar', async () => {
    const res = createSseResponse(
      async () => {
        await new Promise((r) => setTimeout(r, 35));
      },
      undefined,
      10,
    );
    const text = await res.text();
    expect(text.startsWith(': open\n\n')).toBe(true);
    expect(text.match(/: ping\n\n/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it('klien cancel / parent abort → signal run abort dan send diabaikan', async () => {
    let seen: AbortSignal | undefined;
    const res = createSseResponse(
      (send, signal) =>
        new Promise<void>((resolve) => {
          seen = signal;
          signal.addEventListener('abort', () => {
            send('delta', { t: 'tidak terkirim' });
            resolve();
          });
        }),
    );
    const reader = res.body!.getReader();
    await reader.read();
    await reader.cancel();
    expect(seen?.aborted).toBe(true);

    const parent = new AbortController();
    let runSignal: AbortSignal | undefined;
    const res2 = createSseResponse(async (_send, signal) => {
      runSignal = signal;
      await new Promise<void>((r) => signal.addEventListener('abort', () => r()));
    }, parent.signal);
    const done = res2.text();
    parent.abort();
    expect(await done).toBe(': open\n\n');
    expect(runSignal?.aborted).toBe(true);
  });
});
