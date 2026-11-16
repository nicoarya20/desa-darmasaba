// @vitest-environment node
// Route provider suara Jenna (PUT/POST test/DELETE key di /api/developer/jenna/voice/provider): khusus role "0",
// envelope sama dengan route provider chat, row voice tidak pernah masuk ke `providers`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'elysia';

const KEY = 'd'.repeat(64);
const SECRET = 'sk-voice-secret-1234567890LMNO';

const { requireAuthMock, envMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  envMock: { NODE_ENV: 'production', JENNA_CREDENTIALS_KEY: '' },
  prismaMock: {
    jennaSettings: { findUnique: vi.fn() },
    jennaProvider: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/env', () => ({ env: envMock }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import {
  jennaVoiceProviderKeyDelete,
  jennaVoiceProviderTest,
  jennaVoiceProviderUpdate,
} from '@/app/api/[[...slugs]]/_lib/developer/jenna-voice';
import { encryptSecret } from '@/lib/jenna/crypto';

function ctx(body: unknown = undefined) {
  const set: { status?: number } = {};
  return { context: { body, params: {}, set } as unknown as Context, set };
}
const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

const voiceRow = (over: Record<string, unknown> = {}) => ({
  slot: 'voice',
  baseUrl: 'https://live.example.com/v1',
  apiKeyEnc: null as string | null,
  apiKeyHint: null as string | null,
  model: 'gpt-realtime',
  temperature: null,
  maxTokens: null,
  timeoutMs: 30000,
  lastTestAt: null,
  lastTestOk: null,
  lastTestMessage: null,
  updatedAt: new Date('2026-11-14T00:00:00Z'),
  updatedById: 'u-0',
  ...over,
});

const VALID_BODY = { baseUrl: 'https://live.example.com/v1', model: 'gpt-realtime', timeoutMs: 20000 };

let infoSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  envMock.JENNA_CREDENTIALS_KEY = KEY;
  prismaMock.jennaSettings.findUnique.mockResolvedValue(null);
  prismaMock.jennaProvider.findMany.mockResolvedValue([]);
  prismaMock.jennaProvider.findUnique.mockResolvedValue(null);
  prismaMock.jennaProvider.upsert.mockResolvedValue({});
  prismaMock.jennaProvider.updateMany.mockResolvedValue({ count: 1 });
  infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  infoSpy.mockRestore();
  vi.unstubAllGlobals();
});

const HANDLERS = [
  ['PUT /voice/provider', () => jennaVoiceProviderUpdate(ctx(VALID_BODY).context)],
  ['POST /voice/provider/test', () => jennaVoiceProviderTest(ctx().context)],
  ['DELETE /voice/provider/key', () => jennaVoiceProviderKeyDelete(ctx().context)],
] as const;

describe('guard role developer', () => {
  it.each(HANDLERS)('%s tanpa sesi → 401, DB tidak disentuh', async (_name, call) => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
    });
    await expect(call()).resolves.toEqual({ success: false, message: 'Unauthorized' });
    expect(prismaMock.jennaProvider.upsert).not.toHaveBeenCalled();
    expect(prismaMock.jennaProvider.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.jennaProvider.updateMany).not.toHaveBeenCalled();
  });

  it.each(['1', '2', '3'])('role %s → 403 di ketiga route', async (roleId) => {
    asUser(roleId);
    for (const handler of [jennaVoiceProviderUpdate, jennaVoiceProviderTest, jennaVoiceProviderKeyDelete]) {
      const { context, set } = ctx(VALID_BODY);
      await expect(handler(context)).resolves.toMatchObject({ success: false });
      expect(set.status).toBe(403);
    }
    expect(prismaMock.jennaProvider.upsert).not.toHaveBeenCalled();
    expect(prismaMock.jennaProvider.updateMany).not.toHaveBeenCalled();
  });
});

describe('PUT /jenna/voice/provider', () => {
  it('body tidak valid → 400, DB tidak disentuh', async () => {
    asUser('0');
    const { context, set } = ctx({ ...VALID_BODY, model: 'model spasi' });
    await expect(jennaVoiceProviderUpdate(context)).resolves.toEqual({ success: false, message: 'Model suara tidak valid.' });
    expect(set.status).toBe(400);
    expect(prismaMock.jennaProvider.upsert).not.toHaveBeenCalled();
  });

  it('fail-closed: apiKey dikirim tanpa JENNA_CREDENTIALS_KEY → 400, tidak disimpan', async () => {
    asUser('0');
    envMock.JENNA_CREDENTIALS_KEY = '';
    const { context, set } = ctx({ ...VALID_BODY, apiKey: SECRET });
    await expect(jennaVoiceProviderUpdate(context)).resolves.toMatchObject({ success: false });
    expect(set.status).toBe(400);
    expect(prismaMock.jennaProvider.upsert).not.toHaveBeenCalled();
  });

  it('valid → upsert slot voice terenkripsi, temperature/maxTokens null, respons config dengan voiceProvider', async () => {
    asUser('0');
    const enc = encryptSecret(SECRET, KEY);
    prismaMock.jennaProvider.findMany.mockResolvedValue([voiceRow({ apiKeyEnc: enc, apiKeyHint: 'LMNO' })]);
    const { context, set } = ctx({ ...VALID_BODY, apiKey: SECRET });
    const res = await jennaVoiceProviderUpdate(context);

    expect(set.status).toBeUndefined();
    const call = prismaMock.jennaProvider.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ slot: 'voice' });
    expect(call.update).toMatchObject({
      baseUrl: 'https://live.example.com/v1',
      model: 'gpt-realtime',
      timeoutMs: 20000,
      temperature: null,
      maxTokens: null,
      apiKeyHint: 'LMNO',
      lastTestAt: null,
      updatedById: 'u-0',
    });
    expect(call.update.apiKeyEnc).not.toContain(SECRET);

    if (!res.success) throw new Error('unreachable');
    expect(JSON.stringify(res.data)).not.toContain(SECRET);
    expect(JSON.stringify(res.data)).not.toContain(enc);
    expect(res.data.voiceProvider).toMatchObject({ slot: 'voice', hasApiKey: true, apiKeyHint: 'LMNO', ready: true });
    expect(res.data.providers.map((p) => p.slot)).toEqual(['chat_openai', 'chat_anthropic']);
    expect(res.data.providers.every((p) => !p.hasApiKey)).toBe(true);
  });

  it('apiKey kosong → kunci lama dipertahankan (field key tidak ikut di-update)', async () => {
    asUser('0');
    await jennaVoiceProviderUpdate(ctx({ ...VALID_BODY, apiKey: '' }).context);
    const call = prismaMock.jennaProvider.upsert.mock.calls[0][0];
    expect(call.update).not.toHaveProperty('apiKeyEnc');
    expect(call.update).not.toHaveProperty('apiKeyHint');
  });
});

describe('POST /jenna/voice/provider/test', () => {
  it('provider suara belum disimpan → 400 tanpa fetch', async () => {
    asUser('0');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { context, set } = ctx();
    await expect(jennaVoiceProviderTest(context)).resolves.toEqual({
      success: false,
      message: 'Provider suara belum disimpan. Simpan konfigurasi provider suara terlebih dahulu.',
    });
    expect(set.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('row tanpa API key → gagal "belum lengkap" disimpan, tanpa fetch', async () => {
    asUser('0');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    prismaMock.jennaProvider.findUnique.mockResolvedValue(voiceRow());
    prismaMock.jennaProvider.update.mockImplementation(async ({ data }) => voiceRow(data));
    const res = await jennaVoiceProviderTest(ctx().context);

    expect(fetchMock).not.toHaveBeenCalled();
    if (!res.success) throw new Error('unreachable');
    expect(res.data).toMatchObject({
      ok: false,
      message: 'Provider suara belum lengkap. Isi Base URL, model, dan API key terlebih dahulu.',
      latencyMs: 0,
      provider: { slot: 'voice', lastTestOk: false },
    });
    expect(prismaMock.jennaProvider.update.mock.calls[0][0].where).toEqual({ slot: 'voice' });
  });

  it('gateway terjangkau → sukses, GET /models dengan Bearer, hasil tes disimpan', async () => {
    asUser('0');
    const enc = encryptSecret(SECRET, KEY);
    const fetchMock = vi.fn(async () => new Response('', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    prismaMock.jennaProvider.findUnique.mockResolvedValue(voiceRow({ apiKeyEnc: enc, apiKeyHint: 'LMNO' }));
    prismaMock.jennaProvider.update.mockImplementation(async ({ data }) =>
      voiceRow({ apiKeyEnc: enc, apiKeyHint: 'LMNO', ...data }),
    );
    const res = await jennaVoiceProviderTest(ctx().context);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://live.example.com/v1/models');
    expect((init.headers as Record<string, string>).authorization).toBe(`Bearer ${SECRET}`);
    if (!res.success) throw new Error('unreachable');
    expect(res.data.ok).toBe(true);
    expect(res.data.message).toContain('Gateway terjangkau (HTTP 404)');
    expect(res.data.provider).toMatchObject({ slot: 'voice', lastTestOk: true, ready: true });
    expect(JSON.stringify(res.data)).not.toContain(SECRET);
  });
});

describe('DELETE /jenna/voice/provider/key', () => {
  it('developer → key slot voice dikosongkan; satu baris log tanpa key/hint', async () => {
    asUser('0');
    const enc = encryptSecret(SECRET, KEY);
    prismaMock.jennaProvider.findMany.mockResolvedValue([voiceRow()]);
    const res = await jennaVoiceProviderKeyDelete(ctx().context);

    expect(prismaMock.jennaProvider.updateMany).toHaveBeenCalledWith({
      where: { slot: 'voice' },
      data: {
        apiKeyEnc: null,
        apiKeyHint: null,
        lastTestAt: null,
        lastTestOk: null,
        lastTestMessage: null,
        updatedById: 'u-0',
      },
    });
    if (!res.success) throw new Error('unreachable');
    expect(res.data.voiceProvider).toMatchObject({ hasApiKey: false, ready: false, model: 'gpt-realtime' });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    const line = infoSpy.mock.calls[0].join(' ');
    expect(line).toContain('voice');
    expect(line).toContain('u-0');
    expect(line).not.toContain(SECRET);
    expect(line).not.toContain(enc);
    expect(line).not.toContain('LMNO');
  });

  it('idempoten: belum ada row voice tetap sukses', async () => {
    asUser('0');
    prismaMock.jennaProvider.updateMany.mockResolvedValue({ count: 0 });
    await expect(jennaVoiceProviderKeyDelete(ctx().context)).resolves.toMatchObject({ success: true });
  });
});
