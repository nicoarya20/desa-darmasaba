// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { AnthropicProvider, toAnthropicPayload } from '@/lib/jenna/provider/anthropic';
import { anthropicMessagesUrl } from '@/lib/jenna/provider/common';
import { AiProviderError, type ChatMessage } from '@/lib/jenna/provider/types';
import { buildConnectionTestRequest } from '@/lib/jenna/connection-test';

const CFG = {
  baseUrl: 'https://claude.example/v1',
  apiKey: 'sk-ant-SECRET-1234',
  model: 'claude-test',
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

const sse = (events: Array<Record<string, unknown>>) =>
  new Response(events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(''), {
    headers: { 'content-type': 'text/event-stream' },
  });

const user = (content = 'u'): ChatMessage[] => [{ role: 'user', content }];

describe('anthropicMessagesUrl (dipakai adapter & tes koneksi)', () => {
  it('/v1 opsional, trailing slash dirapikan', () => {
    expect(anthropicMessagesUrl('https://a.example')).toBe('https://a.example/v1/messages');
    expect(anthropicMessagesUrl('https://a.example/')).toBe('https://a.example/v1/messages');
    expect(anthropicMessagesUrl('https://a.example/v1')).toBe('https://a.example/v1/messages');
    expect(anthropicMessagesUrl('https://a.example/v1/')).toBe('https://a.example/v1/messages');
  });

  it('tes koneksi memakai aturan yang sama', () => {
    for (const baseUrl of ['https://a.example', 'https://a.example/v1/']) {
      const { url } = buildConnectionTestRequest('chat_anthropic', {
        baseUrl,
        model: 'm',
        apiKey: 'k',
        temperature: null,
        reasoningEffort: null,
      });
      expect(url).toBe(anthropicMessagesUrl(baseUrl));
    }
  });
});

describe('toAnthropicPayload', () => {
  it('system dipisah, tool_result jadi pesan user, role beruntun digabung, arguments di-parse', () => {
    const p = toAnthropicPayload([
      { role: 'system', content: 'aturan' },
      { role: 'user', content: 'cari A' },
      {
        role: 'assistant',
        content: 'sebentar',
        toolCalls: [
          { id: 't1', name: 'cari', arguments: '{"q":"A"}' },
          { id: 't2', name: 'hitung', arguments: 'bukan json' },
        ],
      },
      { role: 'tool', toolCallId: 't1', content: 'hasil 1' },
      { role: 'tool', toolCallId: 't2', content: 'hasil 2' },
    ]);
    expect(p.system).toBe('aturan');
    expect(p.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(p.messages[1].content).toEqual([
      { type: 'text', text: 'sebentar' },
      { type: 'tool_use', id: 't1', name: 'cari', input: { q: 'A' } },
      { type: 'tool_use', id: 't2', name: 'hitung', input: {} },
    ]);
    expect(p.messages[2].content).toEqual([
      { type: 'tool_result', tool_use_id: 't1', content: 'hasil 1' },
      { type: 'tool_result', tool_use_id: 't2', content: 'hasil 2' },
    ]);
  });

  it('pesan kosong dilewati', () => {
    expect(toAnthropicPayload([{ role: 'user', content: '' }, { role: 'user', content: 'halo' }]).messages).toHaveLength(1);
  });
});

describe('AnthropicProvider.chat', () => {
  it('header, body (max_tokens 1024, system cache_control), usage termasuk cache', async () => {
    const f = fakeFetch(() =>
      json({ content: [{ type: 'text', text: 'Halo' }], usage: { input_tokens: 10, output_tokens: 3, cache_read_input_tokens: 5 } }),
    );
    const res = await new AnthropicProvider(CFG, f.impl).chat([
      { role: 'system', content: 'S' },
      { role: 'user', content: 'U' },
    ]);
    expect(res).toEqual({ type: 'text', text: 'Halo', usage: { inputTokens: 15, outputTokens: 3 } });
    const c = f.calls[0];
    expect(c.url).toBe('https://claude.example/v1/messages');
    const h = c.init.headers as Record<string, string>;
    expect(h['x-api-key']).toBe(CFG.apiKey);
    expect(h['anthropic-version']).toBe('2023-06-01');
    expect(h.authorization).toBeUndefined();
    expect(c.init.redirect).toBe('manual');
    expect(c.body.max_tokens).toBe(1024);
    expect(c.body.temperature).toBeUndefined();
    expect(c.body.stream).toBeUndefined();
    expect(c.body.system).toEqual([{ type: 'text', text: 'S', cache_control: { type: 'ephemeral' } }]);
  });

  it('temperature dan maxTokens dikirim bila diisi; tools dipetakan', async () => {
    const f = fakeFetch(() => json({ content: [{ type: 'text', text: 'x' }] }));
    await new AnthropicProvider({ ...CFG, temperature: 0.3, maxTokens: 500 }, f.impl).chat(user(), {
      tools: [{ name: 'cari', description: 'Cari', parameters: { type: 'object', properties: { q: { type: 'string' } } } }],
    });
    const b = f.calls[0].body;
    expect(b.temperature).toBe(0.3);
    expect(b.max_tokens).toBe(500);
    expect(b.tools[0].input_schema.properties.q.type).toBe('string');
    expect(b.tool_choice).toEqual({ type: 'auto' });
  });

  it('tool_use pada respons biasa menjadi tool_calls dengan arguments JSON', async () => {
    const f = fakeFetch(() =>
      json({
        content: [
          { type: 'text', text: 'cek dulu' },
          { type: 'tool_use', id: 'tu1', name: 'cari', input: { q: 'A' } },
          { type: 'tool_use', name: 'hitung', input: [1] },
        ],
      }),
    );
    expect(await new AnthropicProvider(CFG, f.impl).chat(user())).toEqual({
      type: 'tool_calls',
      toolCalls: [
        { id: 'tu1', name: 'cari', arguments: '{"q":"A"}' },
        { id: 'call_1', name: 'hitung', arguments: '{}' },
      ],
      text: 'cek dulu',
      usage: undefined,
    });
  });

  it('stream: delta teks, tool_use dari input_json_delta, usage message_start/message_delta', async () => {
    const deltas: string[] = [];
    const f = fakeFetch(() =>
      sse([
        { type: 'message_start', message: { usage: { input_tokens: 20, output_tokens: 1, cache_creation_input_tokens: 4 } } },
        { type: 'content_block_start', index: 0, content_block: { type: 'text' } },
        { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'Ha' } },
        { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'lo' } },
        { type: 'content_block_stop', index: 0 },
        { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', id: 'tu9', name: 'cari' } },
        { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: '{"q":' } },
        { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: '"B"}' } },
        { type: 'content_block_start', index: 2, content_block: { type: 'tool_use', id: 'tu10', name: 'kosong' } },
        { type: 'message_delta', delta: {}, usage: { output_tokens: 12 } },
        { type: 'message_stop' },
      ]),
    );
    const res = await new AnthropicProvider(CFG, f.impl).chat(user(), { onDelta: (t) => deltas.push(t) });
    expect(f.calls[0].body.stream).toBe(true);
    expect(deltas).toEqual(['Ha', 'lo']);
    expect(res).toEqual({
      type: 'tool_calls',
      toolCalls: [
        { id: 'tu9', name: 'cari', arguments: '{"q":"B"}' },
        { id: 'tu10', name: 'kosong', arguments: '{}' },
      ],
      text: 'Halo',
      usage: { inputTokens: 24, outputTokens: 12 },
    });
  });

  it('proxy yang mengabaikan stream: jawaban jadi satu delta', async () => {
    const deltas: string[] = [];
    const f = fakeFetch(() => json({ content: [{ type: 'text', text: 'Utuh' }] }));
    await new AnthropicProvider(CFG, f.impl).chat(user(), { onDelta: (t) => deltas.push(t) });
    expect(deltas).toEqual(['Utuh']);
  });

  it('event error di stream: overloaded/rate_limit → busy, lainnya → unavailable, tanpa bocor', async () => {
    for (const [type, kind] of [
      ['overloaded_error', 'busy'],
      ['rate_limit_error', 'busy'],
      ['api_error', 'unavailable'],
    ]) {
      const f = fakeFetch(() =>
        sse([
          { type: 'message_start', message: { usage: { input_tokens: 1 } } },
          { type: 'error', error: { type, message: 'rahasia internal' } },
        ]),
      );
      const err = await new AnthropicProvider(CFG, f.impl).chat(user(), { onDelta: () => {} }).catch((e) => e);
      expect(err).toBeInstanceOf(AiProviderError);
      expect(err.kind).toBe(kind);
      expect(err.message).not.toContain('rahasia');
    }
  });

  it('pemetaan status HTTP tanpa membocorkan body atau kunci', async () => {
    const kinds: Record<number, string> = { 401: 'config', 404: 'config', 302: 'config', 429: 'busy', 529: 'busy', 500: 'unavailable' };
    for (const [status, kind] of Object.entries(kinds)) {
      const f = fakeFetch(() => new Response(`bad key ${CFG.apiKey}`, { status: Number(status) }));
      const err = await new AnthropicProvider(CFG, f.impl).chat(user()).catch((e) => e);
      expect(err.kind).toBe(kind);
      expect(String(err.message)).not.toContain('SECRET');
    }
  });

  it('jaringan putus → unavailable; body bukan JSON → bad_response; sinyal batal diteruskan', async () => {
    const down = new AnthropicProvider(CFG, async () => {
      throw new Error('ECONNREFUSED sk-ant-SECRET-1234');
    });
    const e1 = await down.chat(user()).catch((e) => e);
    expect(e1.kind).toBe('unavailable');
    expect(e1.message).not.toContain('ECONNREFUSED');

    const bad = new AnthropicProvider(CFG, async () => new Response('<html>', { status: 200 }));
    expect((await bad.chat(user()).catch((e) => e)).kind).toBe('bad_response');

    const ac = new AbortController();
    const pending = new AnthropicProvider(
      CFG,
      (_url, init) =>
        new Promise((_, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    ).chat(user(), { signal: ac.signal });
    ac.abort();
    expect((await pending.catch((e) => e)).kind).toBe('unavailable');
  });
});
