// @vitest-environment node
// Lib Jenna (fungsi murni): crypto AES-256-GCM, validasi baseUrl/settings/provider, mapping DTO, tes koneksi.
import { describe, expect, it, vi } from 'vitest';
import type { JennaProvider, JennaSettings } from '@prisma/client';
import { apiKeyHint, decryptSecret, encryptSecret, isCredentialsKeyValid, SecretCryptoError } from '@/lib/jenna/crypto';
import { validateBaseUrl, validateProviderInput, validateSettingsInput } from '@/lib/jenna/validation';
import { DEFAULT_JENNA_SETTINGS, toProviderDTO, toProviderDTOs, toSettingsDTO } from '@/lib/jenna/mappers';
import {
  buildConnectionTestRequest,
  describeFetchError,
  describeHttpStatus,
  runConnectionTest,
} from '@/lib/jenna/connection-test';
import { buildEnvChecklist } from '@/app/api/[[...slugs]]/_lib/developer/env-checklist';

const KEY = 'a'.repeat(64);
const OTHER_KEY = 'b'.repeat(64);
const SECRET = 'sk-test-1234567890abcdWXYZ';

describe('crypto AES-256-GCM', () => {
  it('round-trip dan format berversi v1:iv:tag:ct tanpa plaintext', () => {
    const enc = encryptSecret(SECRET, KEY);
    expect(enc.split(':')).toHaveLength(4);
    expect(enc.startsWith('v1:')).toBe(true);
    expect(enc).not.toContain(SECRET);
    expect(decryptSecret(enc, KEY)).toBe(SECRET);
  });

  it('IV acak: enkripsi dua kali menghasilkan ciphertext berbeda', () => {
    expect(encryptSecret(SECRET, KEY)).not.toBe(encryptSecret(SECRET, KEY));
  });

  it('fail-closed: kunci kosong/salah format → KEY_MISSING/KEY_INVALID', () => {
    expect(() => encryptSecret(SECRET, '')).toThrowError(expect.objectContaining({ code: 'KEY_MISSING' }));
    expect(() => encryptSecret(SECRET, undefined)).toThrowError(SecretCryptoError);
    expect(() => encryptSecret(SECRET, 'abc')).toThrowError(expect.objectContaining({ code: 'KEY_INVALID' }));
    expect(() => encryptSecret(SECRET, 'z'.repeat(64))).toThrowError(expect.objectContaining({ code: 'KEY_INVALID' }));
  });

  it('kunci berbeda atau data diubah → DECRYPT_FAILED', () => {
    const enc = encryptSecret(SECRET, KEY);
    expect(() => decryptSecret(enc, OTHER_KEY)).toThrowError(expect.objectContaining({ code: 'DECRYPT_FAILED' }));
    const [v, iv, tag, ct] = enc.split(':');
    const flipped = Buffer.from(ct, 'base64');
    flipped[0] ^= 0xff;
    expect(() => decryptSecret([v, iv, tag, flipped.toString('base64')].join(':'), KEY)).toThrowError(
      expect.objectContaining({ code: 'DECRYPT_FAILED' }),
    );
  });

  it('format tidak dikenal/terpotong → BAD_FORMAT', () => {
    expect(() => decryptSecret('plaintext', KEY)).toThrowError(expect.objectContaining({ code: 'BAD_FORMAT' }));
    expect(() => decryptSecret('v2:a:b:c', KEY)).toThrowError(expect.objectContaining({ code: 'BAD_FORMAT' }));
    expect(() => decryptSecret('v1:AAAA:AAAA:AAAA', KEY)).toThrowError(expect.objectContaining({ code: 'BAD_FORMAT' }));
  });

  it('isCredentialsKeyValid hanya 64 hex', () => {
    expect(isCredentialsKeyValid(KEY)).toBe(true);
    expect(isCredentialsKeyValid(` ${KEY.toUpperCase()} `)).toBe(true);
    expect(isCredentialsKeyValid('')).toBe(false);
    expect(isCredentialsKeyValid(KEY.slice(1))).toBe(false);
  });

  it('apiKeyHint: 4 char terakhir; key pendek tidak diberi hint', () => {
    expect(apiKeyHint(SECRET)).toBe('WXYZ');
    expect(apiKeyHint('short')).toBeNull();
  });
});

describe('validateBaseUrl', () => {
  it('https diterima & trailing slash dibuang', () => {
    expect(validateBaseUrl(' https://api.openai.com/v1/ ', 'production')).toEqual({ ok: true, value: 'https://api.openai.com/v1' });
  });

  it('http hanya localhost/127.0.0.1 di luar production', () => {
    expect(validateBaseUrl('http://localhost:11434/v1', 'development').ok).toBe(true);
    expect(validateBaseUrl('http://127.0.0.1:8080', 'test').ok).toBe(true);
    expect(validateBaseUrl('http://localhost:11434/v1', 'production').ok).toBe(false);
    expect(validateBaseUrl('http://api.example.com', 'development').ok).toBe(false);
    expect(validateBaseUrl('http://10.0.0.5', 'development').ok).toBe(false);
  });

  it('protokol lain, kredensial, query, hash ditolak', () => {
    expect(validateBaseUrl('ftp://x.com', 'development').ok).toBe(false);
    expect(validateBaseUrl('file:///etc/passwd', 'development').ok).toBe(false);
    expect(validateBaseUrl('https://user:pass@x.com', 'production').ok).toBe(false);
    expect(validateBaseUrl('https://x.com/v1?key=1', 'production').ok).toBe(false);
    expect(validateBaseUrl('https://x.com/v1?', 'production').ok).toBe(false);
    expect(validateBaseUrl('https://x.com/v1#a', 'production').ok).toBe(false);
    expect(validateBaseUrl('bukan url', 'production').ok).toBe(false);
    expect(validateBaseUrl('', 'production').ok).toBe(false);
  });
});

describe('validateSettingsInput', () => {
  it('parsial valid → hanya field terkirim, string di-trim', () => {
    expect(validateSettingsInput({ assistantName: '  Jenna  ', enabled: true })).toEqual({
      ok: true,
      value: { assistantName: 'Jenna', enabled: true },
    });
  });

  it('body kosong ditolak', () => {
    expect(validateSettingsInput({}).ok).toBe(false);
  });

  it('batas min/max & bilangan bulat', () => {
    expect(validateSettingsInput({ maxInputChars: 99 }).ok).toBe(false);
    expect(validateSettingsInput({ maxInputChars: 100 }).ok).toBe(true);
    expect(validateSettingsInput({ historyWindow: 2.5 }).ok).toBe(false);
    expect(validateSettingsInput({ dailyTokensGlobal: 0 }).ok).toBe(true);
    expect(validateSettingsInput({ retentionDays: 0 }).ok).toBe(false);
    expect(validateSettingsInput({ assistantName: '   ' }).ok).toBe(false);
    expect(validateSettingsInput({ personaNote: 'x'.repeat(1501) }).ok).toBe(false);
    expect(validateSettingsInput({ personaNote: 'x'.repeat(1500) }).ok).toBe(true);
  });

  it('chatProtocol hanya openai/anthropic', () => {
    expect(validateSettingsInput({ chatProtocol: 'anthropic' }).ok).toBe(true);
    expect(validateSettingsInput({ chatProtocol: 'gemini' as never }).ok).toBe(false);
  });
});

describe('validateProviderInput', () => {
  const base = { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };

  it('default timeout 30000, apiKey kosong = pertahankan (null)', () => {
    expect(validateProviderInput({ ...base, apiKey: '  ' }, 'production')).toEqual({
      ok: true,
      value: { ...base, temperature: null, maxTokens: null, timeoutMs: 30000, apiKey: null },
    });
  });

  it('nilai di luar batas ditolak', () => {
    expect(validateProviderInput({ ...base, model: '' }, 'production').ok).toBe(false);
    expect(validateProviderInput({ ...base, temperature: 2.1 }, 'production').ok).toBe(false);
    expect(validateProviderInput({ ...base, maxTokens: 0 }, 'production').ok).toBe(false);
    expect(validateProviderInput({ ...base, timeoutMs: 500 }, 'production').ok).toBe(false);
    expect(validateProviderInput({ ...base, apiKey: 'sk abc' }, 'production').ok).toBe(false);
    expect(validateProviderInput({ ...base, baseUrl: 'http://evil.com' }, 'production').ok).toBe(false);
  });

  it('temperature/maxTokens valid dipertahankan', () => {
    const r = validateProviderInput({ ...base, temperature: 0.7, maxTokens: 1024, apiKey: SECRET }, 'production');
    expect(r).toMatchObject({ ok: true, value: { temperature: 0.7, maxTokens: 1024, apiKey: SECRET } });
  });
});

const providerRow = (over: Partial<JennaProvider> = {}): JennaProvider => ({
  slot: 'chat_openai',
  baseUrl: 'https://api.openai.com/v1',
  apiKeyEnc: encryptSecret(SECRET, KEY),
  apiKeyHint: 'WXYZ',
  model: 'gpt-4o-mini',
  temperature: null,
  maxTokens: null,
  timeoutMs: 30000,
  lastTestAt: null,
  lastTestOk: null,
  lastTestMessage: null,
  updatedAt: new Date('2026-11-13T00:00:00Z'),
  updatedById: null,
  ...over,
});

describe('mappers (API key tidak bocor)', () => {
  it('provider DTO tanpa apiKeyEnc/plaintext, hasApiKey + hint + ready', () => {
    const dto = toProviderDTO('chat_openai', providerRow());
    const json = JSON.stringify(dto);
    expect(json).not.toContain(SECRET);
    expect(json).not.toContain('v1:');
    expect(dto).not.toHaveProperty('apiKeyEnc');
    expect(dto).not.toHaveProperty('apiKey');
    expect(dto).toMatchObject({ hasApiKey: true, apiKeyHint: 'WXYZ', ready: true, protocol: 'openai' });
  });

  it('tanpa key → ready false, hint null', () => {
    const dto = toProviderDTO('chat_openai', providerRow({ apiKeyEnc: null }));
    expect(dto).toMatchObject({ hasApiKey: false, apiKeyHint: null, ready: false });
  });

  it('semua slot selalu ada; slot kosong pakai default', () => {
    const dtos = toProviderDTOs([providerRow()]);
    expect(dtos.map((d) => d.slot)).toEqual(['chat_openai', 'chat_anthropic']);
    expect(dtos[1]).toMatchObject({ protocol: 'anthropic', hasApiKey: false, ready: false, timeoutMs: 30000, updatedAt: null });
  });

  it('settings null → default; chatProtocol tak dikenal → openai', () => {
    expect(toSettingsDTO(null)).toEqual({ ...DEFAULT_JENNA_SETTINGS, updatedAt: null });
    const row = {
      id: 'global', ...DEFAULT_JENNA_SETTINGS, chatProtocol: 'x',
      updatedAt: new Date('2026-11-13T00:00:00Z'), updatedById: null,
    } as JennaSettings;
    expect(toSettingsDTO(row)).toMatchObject({ chatProtocol: 'openai', updatedAt: '2026-11-13T00:00:00.000Z' });
  });
});

describe('connection test', () => {
  const cfg = { baseUrl: 'https://api.openai.com/v1/', model: 'gpt-4o-mini', apiKey: SECRET };

  it('OpenAI-compatible: GET {base}/models + Bearer', () => {
    const { url, init } = buildConnectionTestRequest('chat_openai', cfg);
    expect(url).toBe('https://api.openai.com/v1/models');
    expect(init.method).toBe('GET');
    expect((init.headers as Record<string, string>).authorization).toBe(`Bearer ${SECRET}`);
  });

  it('Anthropic: POST /v1/messages, max_tokens 1, anthropic-version; base dengan/tanpa /v1', () => {
    const a = buildConnectionTestRequest('chat_anthropic', { ...cfg, baseUrl: 'https://api.anthropic.com' });
    expect(a.url).toBe('https://api.anthropic.com/v1/messages');
    expect(a.init.method).toBe('POST');
    expect((a.init.headers as Record<string, string>)['anthropic-version']).toBe('2023-06-01');
    expect((a.init.headers as Record<string, string>)['x-api-key']).toBe(SECRET);
    expect(JSON.parse(a.init.body as string)).toMatchObject({ model: 'gpt-4o-mini', max_tokens: 1 });
    expect(buildConnectionTestRequest('chat_anthropic', { ...cfg, baseUrl: 'https://api.anthropic.com/v1' }).url).toBe(
      'https://api.anthropic.com/v1/messages',
    );
  });

  it('pesan status HTTP tidak memuat body/key', () => {
    expect(describeHttpStatus(200).ok).toBe(true);
    expect(describeHttpStatus(302)).toMatchObject({ ok: false });
    expect(describeHttpStatus(401).message).toContain('API key ditolak');
    expect(describeHttpStatus(503).ok).toBe(false);
  });

  it('error jaringan diklasifikasi tanpa detail mentah', () => {
    expect(describeFetchError(Object.assign(new Error('x'), { name: 'AbortError' }))).toContain('timeout');
    expect(describeFetchError(new TypeError('fetch failed', { cause: { code: 'ENOTFOUND' } }))).toContain('tidak ditemukan');
    expect(describeFetchError(new Error(`boom ${SECRET}`))).not.toContain(SECRET);
  });

  it('runConnectionTest: redirect manual + signal, hasil sukses & gagal', async () => {
    const fetchOk = vi.fn(async () => new Response('{"data":[]}', { status: 200 }));
    const ok = await runConnectionTest('chat_openai', { ...cfg, timeoutMs: 5000 }, fetchOk as unknown as typeof fetch);
    expect(ok.ok).toBe(true);
    const init = (fetchOk.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(init.redirect).toBe('manual');
    expect(init.signal).toBeInstanceOf(AbortSignal);

    const fetch401 = vi.fn(async () => new Response(`{"error":"bad key ${SECRET}"}`, { status: 401 }));
    const bad = await runConnectionTest('chat_openai', { ...cfg, timeoutMs: 5000 }, fetch401 as unknown as typeof fetch);
    expect(bad.ok).toBe(false);
    expect(bad.message).not.toContain(SECRET);
  });

  it('runConnectionTest: timeout membatalkan fetch', async () => {
    const hang = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
        }),
    );
    const res = await runConnectionTest('chat_openai', { ...cfg, timeoutMs: 20 }, hang as unknown as typeof fetch);
    expect(res).toMatchObject({ ok: false });
    expect(res.message).toContain('timeout');
  });
});

describe('buildEnvChecklist', () => {
  it('hanya nama + set, nilai tidak pernah ikut', () => {
    const vals: Record<string, string> = { A: 'rahasia', B: '  ' };
    const list = buildEnvChecklist((n) => vals[n], ['A', 'B', 'C']);
    expect(list).toEqual([
      { name: 'A', set: true },
      { name: 'B', set: false },
      { name: 'C', set: false },
    ]);
    expect(JSON.stringify(list)).not.toContain('rahasia');
  });
});
