// @vitest-environment node
// errorDetail Jenna: sanitasi (kredensial, PII, batas panjang) dan `detail` yang diisi adapter provider
// saat respons non-2xx / stream rusak — pesan publik (`message`) tetap baku.
import { describe, expect, it } from 'vitest';
import {
  CREDENTIAL_MASK,
  describeError,
  describeTurnError,
  ERROR_DETAIL_MAX_CHARS,
  sanitizeErrorDetail,
} from '@/lib/jenna/error-detail';
import { AnthropicProvider } from '@/lib/jenna/provider/anthropic';
import { PROVIDER_ERROR_MESSAGES } from '@/lib/jenna/provider/common';
import { OpenAICompatibleProvider } from '@/lib/jenna/provider/openai-compatible';
import { AiProviderError, type AIProvider, type ChatMessage } from '@/lib/jenna/provider/types';

// Sengaja tidak berbentuk `sk-…`: yang diuji penyamaran literal kunci terpasang.
const API_KEY = 'kunci-RAHASIA-777';
const CFG = { baseUrl: 'https://llm.example/v1', apiKey: API_KEY, model: 'm', temperature: null, maxTokens: null, timeoutMs: 5000 };
const USER: ChatMessage[] = [{ role: 'user', content: 'u' }];

const respond = (res: () => Response) => async () => res();
const eventStream = (raw: string) => new Response(raw, { headers: { 'content-type': 'text/event-stream' } });

async function failure(provider: AIProvider, stream = false): Promise<AiProviderError> {
  const err = await provider.chat(USER, stream ? { onDelta: () => {} } : {}).catch((e: unknown) => e);
  expect(err).toBeInstanceOf(AiProviderError);
  return err as AiProviderError;
}

describe('sanitizeErrorDetail', () => {
  it('merapatkan spasi dan baris', () => {
    expect(sanitizeErrorDetail('  a\n\n   b\tc  ')).toBe('a b c');
  });

  it('menyamarkan kredensial: Bearer, x-api-key, api_key, sk-…, dan kunci terpasang', () => {
    const raw = [
      'Authorization: Bearer abc.DEF-123',
      'x-api-key: xyz987',
      '{"api_key":"qwe456","apiKey": "rty000"}',
      'Incorrect API key provided: sk-proj-ab***********yz',
      `echo ${API_KEY}`,
    ].join('\n');
    const out = sanitizeErrorDetail(raw, [API_KEY]);
    expect(out).toBe(
      [
        `Authorization: Bearer ${CREDENTIAL_MASK}`,
        `x-api-key: ${CREDENTIAL_MASK}`,
        `{"api_key":"${CREDENTIAL_MASK}","apiKey": "${CREDENTIAL_MASK}"}`,
        `Incorrect API key provided: ${CREDENTIAL_MASK}`,
        `echo ${CREDENTIAL_MASK}`,
      ].join(' '),
    );
    for (const secret of ['abc.DEF-123', 'xyz987', 'qwe456', 'rty000', 'sk-proj', API_KEY]) expect(out).not.toContain(secret);
  });

  it('menyamarkan PII lewat maskPii', () => {
    expect(sanitizeErrorDetail('NIK 3171012345678901 hp 081234567890 surel warga@contoh.id')).toBe(
      'NIK [NIK disamarkan] hp [nomor disamarkan] surel [email disamarkan]',
    );
  });

  it('dibatasi 2000 karakter, kredensial di ujung tidak terpotong lolos, dan idempoten', () => {
    const raw = `${'x'.repeat(ERROR_DETAIL_MAX_CHARS - 10)} Bearer token-sangat-rahasia ${'y'.repeat(500)}`;
    const out = sanitizeErrorDetail(raw);
    expect(out).toHaveLength(ERROR_DETAIL_MAX_CHARS);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toContain('token-sangat');
    expect(sanitizeErrorDetail(out)).toBe(out);

    const full = sanitizeErrorDetail(`Authorization: Bearer abc x-api-key=def ${API_KEY}`, [API_KEY]);
    expect(sanitizeErrorDetail(full, [API_KEY])).toBe(full);
  });

  it('rahasia kosong diabaikan (slot tanpa kunci)', () => {
    expect(sanitizeErrorDetail('abc', [''])).toBe('abc');
  });
});

describe('describeTurnError', () => {
  it('AiProviderError: status HTTP + detail vendor; tanpa keduanya memakai nama & pesan', () => {
    expect(describeTurnError(new AiProviderError('busy', 'publik', 429, { detail: '{"error":"rate"}' }))).toBe('HTTP 429: {"error":"rate"}');
    expect(describeTurnError(new AiProviderError('unavailable', 'publik', 502))).toBe('HTTP 502');
    expect(describeTurnError(new AiProviderError('bad_response', 'publik', undefined, { detail: 'Stream tanpa body' }))).toBe('Stream tanpa body');
    expect(describeTurnError(new AiProviderError('unavailable', 'publik'))).toBe('AiProviderError: publik');
  });

  it('error lain: `Nama: pesan` (+ satu tingkat cause), tetap disanitasi', () => {
    expect(describeTurnError(new RangeError('di luar batas'))).toBe('RangeError: di luar batas');
    expect(describeError(new TypeError('fetch failed', { cause: new Error('connect ECONNREFUSED') }))).toBe(
      'TypeError: fetch failed (cause: Error: connect ECONNREFUSED)',
    );
    expect(describeTurnError(new Error('token sk-abcd1234 bocor'))).toBe(`Error: token ${CREDENTIAL_MASK} bocor`);
    expect(describeTurnError('teks biasa')).toBe('teks biasa');
  });
});

describe('adapter mengisi AiProviderError.detail', () => {
  it('OpenAI non-2xx: body vendor masuk detail (kunci & PII disamarkan), message tetap baku', async () => {
    const body = JSON.stringify({ error: { message: `Incorrect API key provided: ${API_KEY}.\nHubungi admin@contoh.id`, code: 'invalid_api_key' } });
    const err = await failure(new OpenAICompatibleProvider(CFG, respond(() => new Response(body, { status: 401 }))));
    expect(err).toMatchObject({ kind: 'config', status: 401, message: PROVIDER_ERROR_MESSAGES.config });
    expect(err.detail).toContain(`Incorrect API key provided: ${CREDENTIAL_MASK}.`);
    expect(err.detail).toContain('[email disamarkan]');
    expect(err.detail).toContain('invalid_api_key');
    expect(JSON.stringify({ ...err, detail: err.detail })).not.toContain(API_KEY);
    expect(describeTurnError(err)).toBe(`HTTP 401: ${err.detail}`);
  });

  it('Anthropic non-2xx: body masuk detail; body raksasa dibatasi', async () => {
    const overloaded = JSON.stringify({ type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } });
    const busy = await failure(new AnthropicProvider(CFG, respond(() => new Response(overloaded, { status: 529 }))));
    expect(busy).toMatchObject({ kind: 'busy', status: 529, message: PROVIDER_ERROR_MESSAGES.busy });
    expect(busy.detail).toBe(overloaded);

    const huge = await failure(new AnthropicProvider(CFG, respond(() => new Response('<html>'.repeat(20_000), { status: 502 }))));
    expect(huge.kind).toBe('unavailable');
    expect(huge.detail).toHaveLength(ERROR_DETAIL_MAX_CHARS);
  });

  it('non-2xx tanpa body: detail kosong, status tetap dilaporkan', async () => {
    const err = await failure(new OpenAICompatibleProvider(CFG, respond(() => new Response(null, { status: 503 }))));
    expect(err.detail).toBeUndefined();
    expect(describeTurnError(err)).toBe('HTTP 503');
  });

  it('respons 200 tak terbaca: JSON rusak & bentuk tak dikenal', async () => {
    const notJson = await failure(new OpenAICompatibleProvider(CFG, respond(() => new Response('<html>gateway</html>'))));
    expect(notJson).toMatchObject({ kind: 'bad_response', status: 200, message: PROVIDER_ERROR_MESSAGES.bad_response });
    expect(notJson.detail).toMatch(/^SyntaxError: /);

    const noChoices = await failure(
      new OpenAICompatibleProvider(CFG, respond(() => Response.json({ error: { message: `quota habis ${API_KEY}` } }))),
    );
    expect(noChoices.kind).toBe('bad_response');
    expect(noChoices.detail).toBe(`Respons tanpa choices[0].message: {"error":{"message":"quota habis ${CREDENTIAL_MASK}"}}`);

    const noContent = await failure(new AnthropicProvider(CFG, respond(() => Response.json({ type: 'message' }))));
    expect(noContent.detail).toBe('Respons tanpa content[]: {"type":"message"}');
  });

  it('stream rusak: potongan chunk ikut ke detail (OpenAI & Anthropic)', async () => {
    const openai = await failure(new OpenAICompatibleProvider(CFG, respond(() => eventStream('data: {rusak\n\n'))), true);
    expect(openai).toMatchObject({ kind: 'bad_response', message: PROVIDER_ERROR_MESSAGES.bad_response });
    expect(openai.detail).toBe('Invalid JSON chunk in stream: {rusak');

    const anthropic = await failure(new AnthropicProvider(CFG, respond(() => eventStream('data: <html>\n\n'))), true);
    expect(anthropic.detail).toBe('Invalid JSON chunk in stream: <html>');

    const empty = await failure(new OpenAICompatibleProvider(CFG, respond(() => eventStream(''))), true);
    expect(empty.detail).toBe('Empty stream');
  });

  it('event error di stream Anthropic: tipe & pesan vendor masuk detail, kunci disamarkan', async () => {
    const event = { type: 'error', error: { type: 'overloaded_error', message: `Overloaded (${API_KEY})` } };
    const err = await failure(new AnthropicProvider(CFG, respond(() => eventStream(`data: ${JSON.stringify(event)}\n\n`))), true);
    expect(err).toMatchObject({ kind: 'busy', message: PROVIDER_ERROR_MESSAGES.busy });
    expect(err.detail).toBe(`Event error di stream: {"type":"overloaded_error","message":"Overloaded (${CREDENTIAL_MASK})"}`);
  });

  it('jaringan gagal: alasan di balik "fetch failed" masuk detail', async () => {
    const down = async () => {
      throw new TypeError('fetch failed', { cause: new Error('connect ECONNREFUSED') });
    };
    const err = await failure(new OpenAICompatibleProvider(CFG, down));
    expect(err).toMatchObject({ kind: 'unavailable', message: PROVIDER_ERROR_MESSAGES.unavailable });
    expect(err.status).toBeUndefined();
    expect(err.detail).toBe('TypeError: fetch failed (cause: Error: connect ECONNREFUSED)');
  });
});
