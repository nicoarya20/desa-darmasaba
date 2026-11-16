// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { AnthropicProvider } from '@/lib/jenna/provider/anthropic';
import { DEFAULT_MAX_TOKENS, PROVIDER_ERROR_MESSAGES } from '@/lib/jenna/provider/common';
import { OpenAICompatibleProvider } from '@/lib/jenna/provider/openai-compatible';
import { createStreamAccumulator } from '@/lib/jenna/provider/openai-stream';
import { createTextProvider } from '@/lib/jenna/provider/resolve';
import { AiProviderError, type ChatMessage } from '@/lib/jenna/provider/types';
import { DeadlineExceededError } from '@/lib/jenna/runtime/deadline';

const CFG = {
  baseUrl: 'https://oai.example/v1',
  apiKey: 'sk-SECRET-1234',
  model: 'gpt-test',
  temperature: null,
  maxTokens: null,
  reasoningEffort: null,
  timeoutMs: 5000,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Captured = { url: string; init: RequestInit; body: Record<string, any> };

function fakeFetch(respond: () => Response) {
  const calls: Captured[] = [];
  const impl = async (url: string, init: RequestInit) => {
    calls.push({ url, init, body: JSON.parse(String(init.body)) });
    return respond();
  };
  return { impl, calls };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const sse = (chunks: unknown[], { done = true } = {}) =>
  new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('') + (done ? 'data: [DONE]\n\n' : ''), {
    headers: { 'content-type': 'text/event-stream' },
  });

const textChunk = (content: string) => ({ choices: [{ delta: { content } }] });
const user = (content = 'u'): ChatMessage[] => [{ role: 'user', content }];

describe('OpenAICompatibleProvider — permintaan', () => {
  it('URL, header, body; max_tokens default 1024 bila null; tanpa stream', async () => {
    const f = fakeFetch(() =>
      json({ choices: [{ message: { content: 'Halo' } }], usage: { prompt_tokens: 10, completion_tokens: 3 } }),
    );
    const res = await new OpenAICompatibleProvider(CFG, f.impl).chat([
      { role: 'system', content: 'S' },
      { role: 'user', content: 'U' },
    ]);
    expect(res).toEqual({ type: 'text', text: 'Halo', usage: { inputTokens: 10, outputTokens: 3 } });

    const c = f.calls[0];
    expect(c.url).toBe('https://oai.example/v1/chat/completions');
    const h = c.init.headers as Record<string, string>;
    expect(h.authorization).toBe(`Bearer ${CFG.apiKey}`);
    expect(h['x-api-key']).toBeUndefined();
    expect(c.init.redirect).toBe('manual');
    expect(c.body.model).toBe('gpt-test');
    expect(c.body.max_tokens).toBe(DEFAULT_MAX_TOKENS);
    expect(DEFAULT_MAX_TOKENS).toBe(1024);
    expect(c.body).not.toHaveProperty('max_completion_tokens');
    expect(c.body).not.toHaveProperty('reasoning_effort');
    expect(c.body.temperature).toBeUndefined();
    expect(c.body.stream).toBeUndefined();
    expect(c.body.messages[0]).toEqual({ role: 'system', content: 'S' });
  });

  it('garis miring berlebih di baseUrl dirapikan', async () => {
    const f = fakeFetch(() => json({ choices: [{ message: { content: 'x' } }] }));
    await new OpenAICompatibleProvider({ ...CFG, baseUrl: 'https://oai.example/v1//' }, f.impl).chat(user());
    expect(f.calls[0].url).toBe('https://oai.example/v1/chat/completions');
  });

  it('temperature (termasuk 0) dan maxTokens dikirim bila diisi; tools dipetakan', async () => {
    const f = fakeFetch(() => json({ choices: [{ message: { content: 'x' } }] }));
    const parameters = { type: 'object', properties: { q: { type: 'string' } } };
    await new OpenAICompatibleProvider({ ...CFG, temperature: 0, maxTokens: 500 }, f.impl).chat(user(), {
      tools: [{ name: 'cari', description: 'Cari', parameters }],
    });
    const b = f.calls[0].body;
    expect(b.temperature).toBe(0);
    expect(b.max_tokens).toBe(500);
    expect(b.tools[0]).toEqual({ type: 'function', function: { name: 'cari', description: 'Cari', parameters } });
    expect(b.tool_choice).toBe('auto');
  });

  it('reasoningEffort diisi → reasoning_effort + max_completion_tokens, tanpa max_tokens (non-stream & stream)', async () => {
    const cases = [
      { cfg: { reasoningEffort: 'none', maxTokens: 500 }, limit: 500, stream: false },
      { cfg: { reasoningEffort: 'high', maxTokens: null }, limit: DEFAULT_MAX_TOKENS, stream: false },
      { cfg: { reasoningEffort: 'low', maxTokens: 700, temperature: 0.2 }, limit: 700, stream: true },
    ];
    for (const { cfg, limit, stream } of cases) {
      const f = fakeFetch(() => (stream ? sse([textChunk('x')]) : json({ choices: [{ message: { content: 'x' } }] })));
      await new OpenAICompatibleProvider({ ...CFG, ...cfg }, f.impl).chat(user(), stream ? { onDelta: () => {} } : {});
      const b = f.calls[0].body;
      expect(b.reasoning_effort).toBe(cfg.reasoningEffort);
      expect(b.max_completion_tokens).toBe(limit);
      expect(b).not.toHaveProperty('max_tokens');
      expect(b.temperature).toBe(cfg.temperature);
      expect(b.stream).toBe(stream ? true : undefined);
    }
  });

  it('assistant tool_calls membawa arguments mentah; hasil tool menjadi role tool', async () => {
    const f = fakeFetch(() => json({ choices: [{ message: { content: 'x' } }] }));
    await new OpenAICompatibleProvider(CFG, f.impl).chat([
      { role: 'user', content: 'cari' },
      { role: 'assistant', content: 'sebentar', toolCalls: [{ id: 't1', name: 'cari', arguments: '{"q":"A"}' }] },
      { role: 'tool', toolCallId: 't1', content: 'hasil 1' },
      { role: 'assistant', content: '', toolCalls: [{ id: 't2', name: 'cari', arguments: '' }] },
    ]);
    const m = f.calls[0].body.messages;
    expect(m[1]).toEqual({
      role: 'assistant',
      content: 'sebentar',
      tool_calls: [{ id: 't1', type: 'function', function: { name: 'cari', arguments: '{"q":"A"}' } }],
    });
    expect(m[2]).toEqual({ role: 'tool', tool_call_id: 't1', content: 'hasil 1' });
    expect(m[3].content).toBeNull();
    expect(m[3].tool_calls[0].function.arguments).toBe('{}');
  });
});

describe('OpenAICompatibleProvider — respons', () => {
  it('tool_calls respons biasa: tanpa nama dibuang, id kosong → call_<i>, arguments mentah', async () => {
    const f = fakeFetch(() =>
      json({
        choices: [
          {
            message: {
              content: 'cek dulu',
              tool_calls: [
                { id: 'tc1', function: { name: 'cari', arguments: '{"q":"A"}' } },
                { id: 'x', function: { arguments: '{}' } },
                { function: { name: 'hitung', arguments: '' } },
              ],
            },
          },
        ],
      }),
    );
    const res = await new OpenAICompatibleProvider(CFG, f.impl).chat(user());
    expect(res).toEqual({
      type: 'tool_calls',
      toolCalls: [
        { id: 'tc1', name: 'cari', arguments: '{"q":"A"}' },
        { id: 'call_1', name: 'hitung', arguments: '{}' },
      ],
      text: 'cek dulu',
      usage: undefined,
    });
  });

  it('content null tanpa tool call menjadi teks kosong', async () => {
    const f = fakeFetch(() => json({ choices: [{ message: { content: null } }] }));
    expect(await new OpenAICompatibleProvider(CFG, f.impl).chat(user())).toEqual({ type: 'text', text: '', usage: undefined });
  });
});

describe('OpenAICompatibleProvider — stream', () => {
  it('delta teks, tool_calls digabung per index, dan usage (include_usage)', async () => {
    const deltas: string[] = [];
    const f = fakeFetch(() =>
      sse([
        textChunk('Ha'),
        textChunk('lo'),
        { choices: [{ delta: { tool_calls: [{ index: 0, id: 'tc9', function: { name: 'ca' } }] } }] },
        { choices: [{ delta: { tool_calls: [{ index: 0, function: { name: 'ri', arguments: '{"q":' } }] } }] },
        { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '"B"}' } }] } }] },
        { choices: [], usage: { prompt_tokens: 20, completion_tokens: 12 } },
      ]),
    );
    const res = await new OpenAICompatibleProvider(CFG, f.impl).chat(user(), { onDelta: (t) => deltas.push(t) });
    expect(f.calls[0].body.stream).toBe(true);
    expect(f.calls[0].body.stream_options).toEqual({ include_usage: true });
    expect(f.calls[0].body.max_tokens).toBe(DEFAULT_MAX_TOKENS);
    expect(f.calls[0].body).not.toHaveProperty('max_completion_tokens');
    expect(f.calls[0].body).not.toHaveProperty('reasoning_effort');
    expect(deltas).toEqual(['Ha', 'lo']);
    expect(res).toEqual({
      type: 'tool_calls',
      toolCalls: [{ id: 'tc9', name: 'cari', arguments: '{"q":"B"}' }],
      text: 'Halo',
      usage: { inputTokens: 20, outputTokens: 12 },
    });
  });

  it('stream tanpa [DONE] tetap selesai saat body habis', async () => {
    const deltas: string[] = [];
    const f = fakeFetch(() => sse([textChunk('Utuh')], { done: false }));
    const res = await new OpenAICompatibleProvider(CFG, f.impl).chat(user(), { onDelta: (t) => deltas.push(t) });
    expect(deltas).toEqual(['Utuh']);
    expect(res).toEqual({ type: 'text', text: 'Utuh', usage: undefined });
  });

  it('proxy yang mengabaikan stream: jawaban jadi satu delta', async () => {
    const deltas: string[] = [];
    const f = fakeFetch(() => json({ choices: [{ message: { content: 'Utuh' } }] }));
    await new OpenAICompatibleProvider(CFG, f.impl).chat(user(), { onDelta: (t) => deltas.push(t) });
    expect(deltas).toEqual(['Utuh']);
  });

  it('chunk rusak / stream kosong → bad_response; putus di tengah → unavailable tanpa bocor', async () => {
    const broken = fakeFetch(
      () =>
        new Response('data: {"choices":[{"delta":{"content":"a"}}]}\n\ndata: {rusak\n\n', {
          headers: { 'content-type': 'text/event-stream' },
        }),
    );
    const e1 = await new OpenAICompatibleProvider(CFG, broken.impl).chat(user(), { onDelta: () => {} }).catch((e) => e);
    expect(e1).toBeInstanceOf(AiProviderError);
    expect(e1.kind).toBe('bad_response');

    const empty = fakeFetch(() => sse([]));
    const e2 = await new OpenAICompatibleProvider(CFG, empty.impl).chat(user(), { onDelta: () => {} }).catch((e) => e);
    expect(e2.kind).toBe('bad_response');

    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[]}\n\n'));
        controller.error(new Error('koneksi putus sk-SECRET-1234'));
      },
    });
    const cut = fakeFetch(() => new Response(body, { headers: { 'content-type': 'text/event-stream' } }));
    const e3 = await new OpenAICompatibleProvider(CFG, cut.impl).chat(user(), { onDelta: () => {} }).catch((e) => e);
    expect(e3.kind).toBe('unavailable');
    expect(String(e3.message)).not.toContain('SECRET');
  });
});

describe('OpenAICompatibleProvider — kegagalan', () => {
  it('status HTTP → kind, pesan publik tetap, body/kunci tidak bocor', async () => {
    const kinds: Record<number, string> = {
      401: 'config',
      403: 'config',
      404: 'config',
      302: 'config',
      429: 'busy',
      529: 'busy',
      500: 'unavailable',
      503: 'unavailable',
    };
    for (const [status, kind] of Object.entries(kinds)) {
      const f = fakeFetch(() => new Response(`bad key ${CFG.apiKey}`, { status: Number(status) }));
      const err = await new OpenAICompatibleProvider(CFG, f.impl).chat(user()).catch((e) => e);
      expect(err.kind).toBe(kind);
      expect(err.status).toBe(Number(status));
      expect(err.message).toBe(PROVIDER_ERROR_MESSAGES[kind as keyof typeof PROVIDER_ERROR_MESSAGES]);
      expect(String(err.message)).not.toContain('SECRET');
    }
  });

  it('jaringan putus → unavailable (detail hanya di cause); body bukan JSON / tanpa choices → bad_response', async () => {
    const down = new OpenAICompatibleProvider(CFG, async () => {
      throw new Error('ECONNREFUSED sk-SECRET-1234');
    });
    const e1 = await down.chat(user()).catch((e) => e);
    expect(e1.kind).toBe('unavailable');
    expect(e1.message).not.toContain('ECONNREFUSED');
    expect(e1.message).not.toContain('SECRET');
    expect((e1.cause as Error).message).toContain('ECONNREFUSED');

    const html = new OpenAICompatibleProvider(CFG, async () => new Response('<html>', { status: 200 }));
    expect((await html.chat(user()).catch((e) => e)).kind).toBe('bad_response');

    const noChoices = new OpenAICompatibleProvider(CFG, fakeFetch(() => json({ choices: [] })).impl);
    expect((await noChoices.chat(user()).catch((e) => e)).kind).toBe('bad_response');
  });

  it('sinyal batal diteruskan; timeoutMs membatalkan permintaan menggantung (cause DeadlineExceededError)', async () => {
    const hang = (_url: string, init: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
      });
    const ac = new AbortController();
    const pending = new OpenAICompatibleProvider(CFG, hang).chat(user(), { signal: ac.signal });
    ac.abort();
    expect((await pending.catch((e) => e)).kind).toBe('unavailable');

    const err = await new OpenAICompatibleProvider({ ...CFG, timeoutMs: 10 }, hang).chat(user()).catch((e) => e);
    expect(err.kind).toBe('unavailable');
    expect(err.cause).toBeInstanceOf(DeadlineExceededError);
  });
});

describe('createStreamAccumulator', () => {
  it('beberapa tool call dipisah per index dan diurutkan; tanpa id → call_<index>', () => {
    const acc = createStreamAccumulator(() => {});
    acc.push({
      choices: [
        {
          delta: {
            tool_calls: [
              { index: 1, id: 'b', function: { name: 'kedua', arguments: '{}' } },
              { index: 0, id: 'a', function: { name: 'pertama', arguments: '{}' } },
              { index: 3, function: { name: 'ketiga' } },
            ],
          },
        },
      ],
    });
    expect(acc.result()).toEqual({
      type: 'tool_calls',
      toolCalls: [
        { id: 'a', name: 'pertama', arguments: '{}' },
        { id: 'b', name: 'kedua', arguments: '{}' },
        { id: 'call_3', name: 'ketiga', arguments: '{}' },
      ],
      text: undefined,
      usage: undefined,
    });
  });
});

describe('createTextProvider', () => {
  it('memilih adapter sesuai protokol', () => {
    expect(createTextProvider('openai', CFG)).toBeInstanceOf(OpenAICompatibleProvider);
    expect(createTextProvider('anthropic', CFG)).toBeInstanceOf(AnthropicProvider);
  });
});
