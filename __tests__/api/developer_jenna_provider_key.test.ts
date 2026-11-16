// @vitest-environment node
// Hapus API key provider Jenna (DELETE /api/developer/jenna/providers/:slot/key): khusus role "0",
// key + hasil tes dikosongkan, idempoten, dan log tidak pernah memuat key maupun hint.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'elysia';

const KEY = 'c'.repeat(64);
const SECRET = 'sk-ant-secret-1234567890QRST';

const { requireAuthMock, envMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  envMock: { NODE_ENV: 'production', JENNA_CREDENTIALS_KEY: '' },
  prismaMock: {
    jennaSettings: { findUnique: vi.fn() },
    jennaProvider: { findMany: vi.fn(), updateMany: vi.fn() },
  },
}));

vi.mock('@/lib/api-auth', () => ({ requireAuth: () => requireAuthMock() }));
vi.mock('@/lib/env', () => ({ env: envMock }));
vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import { jennaProviderKeyDelete } from '@/app/api/[[...slugs]]/_lib/developer/jenna';
import { encryptSecret } from '@/lib/jenna/crypto';
import { clearJennaProviderKey } from '@/lib/jenna/service';

function ctx(slot: string) {
  const set: { status?: number } = {};
  return { context: { body: undefined, params: { slot }, set } as unknown as Context, set };
}
const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

const row = (key: { apiKeyEnc: string | null; apiKeyHint: string | null }) => ({
  slot: 'chat_anthropic',
  baseUrl: 'https://api.anthropic.com',
  ...key,
  model: 'claude-x',
  temperature: null,
  maxTokens: null,
  timeoutMs: 30000,
  lastTestAt: null,
  lastTestOk: null,
  lastTestMessage: null,
  updatedAt: new Date('2026-11-13T00:00:00Z'),
  updatedById: 'u-0',
});

const CLEARED = {
  apiKeyEnc: null,
  apiKeyHint: null,
  lastTestAt: null,
  lastTestOk: null,
  lastTestMessage: null,
};

let infoSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  envMock.JENNA_CREDENTIALS_KEY = KEY;
  prismaMock.jennaSettings.findUnique.mockResolvedValue(null);
  prismaMock.jennaProvider.findMany.mockResolvedValue([]);
  prismaMock.jennaProvider.updateMany.mockResolvedValue({ count: 1 });
  infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  infoSpy.mockRestore();
});

describe('clearJennaProviderKey', () => {
  it('mengosongkan key + hint + hasil tes dan mencatat pengubah; Base URL & model tidak disentuh', async () => {
    await clearJennaProviderKey('u-0', 'chat_anthropic');
    expect(prismaMock.jennaProvider.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.jennaProvider.updateMany).toHaveBeenCalledWith({
      where: { slot: 'chat_anthropic' },
      data: { ...CLEARED, updatedById: 'u-0' },
    });
  });

  it('idempoten: slot tanpa row (count 0) tetap sukses', async () => {
    prismaMock.jennaProvider.updateMany.mockResolvedValue({ count: 0 });
    await expect(clearJennaProviderKey('u-0', 'chat_openai')).resolves.toBeUndefined();
    await expect(clearJennaProviderKey('u-0', 'chat_openai')).resolves.toBeUndefined();
    expect(prismaMock.jennaProvider.updateMany).toHaveBeenCalledTimes(2);
  });
});

describe('DELETE /jenna/providers/:slot/key', () => {
  it('tanpa sesi → 401, DB tidak disentuh', async () => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
    });
    const { context, set } = ctx('chat_anthropic');
    const res = await jennaProviderKeyDelete(context);
    expect(res).toEqual({ success: false, message: 'Unauthorized' });
    expect(set.status).toBe(401);
    expect(prismaMock.jennaProvider.updateMany).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it.each(['1', '2', '3', '4', '5'])('role %s → 403, DB tidak disentuh', async (roleId) => {
    asUser(roleId);
    const { context, set } = ctx('chat_anthropic');
    const res = await jennaProviderKeyDelete(context);
    expect(res).toMatchObject({ success: false });
    expect(set.status).toBe(403);
    expect(prismaMock.jennaProvider.updateMany).not.toHaveBeenCalled();
    expect(prismaMock.jennaProvider.findMany).not.toHaveBeenCalled();
  });

  it('slot tidak dikenal → 404, DB tidak disentuh', async () => {
    asUser('0');
    const { context, set } = ctx('chat_gemini');
    const res = await jennaProviderKeyDelete(context);
    expect(set.status).toBe(404);
    expect(res).toMatchObject({ success: false });
    expect(prismaMock.jennaProvider.updateMany).not.toHaveBeenCalled();
  });

  it('developer → key dihapus, respons = config terbaru tanpa key', async () => {
    asUser('0');
    prismaMock.jennaProvider.findMany.mockResolvedValue([row({ apiKeyEnc: null, apiKeyHint: null })]);
    const { context, set } = ctx('chat_anthropic');
    const res = await jennaProviderKeyDelete(context);

    expect(set.status).toBeUndefined();
    expect(prismaMock.jennaProvider.updateMany).toHaveBeenCalledWith({
      where: { slot: 'chat_anthropic' },
      data: { ...CLEARED, updatedById: 'u-0' },
    });
    if (!res.success) throw new Error('unreachable');
    expect(res.data.providers.find((p) => p.slot === 'chat_anthropic')).toMatchObject({
      hasApiKey: false,
      apiKeyHint: null,
      ready: false,
      baseUrl: 'https://api.anthropic.com',
      model: 'claude-x',
      lastTestAt: null,
    });
  });

  it('slot yang belum punya row/key tetap sukses (idempoten)', async () => {
    asUser('0');
    prismaMock.jennaProvider.updateMany.mockResolvedValue({ count: 0 });
    const res = await jennaProviderKeyDelete(ctx('chat_openai').context);
    expect(res).toMatchObject({ success: true });
  });

  it('satu baris log berisi slot & id developer, tanpa key maupun hint', async () => {
    asUser('0');
    // Respons config masih memuat row ber-key untuk memastikan log tidak mengambil apa pun darinya.
    const enc = encryptSecret(SECRET, KEY);
    prismaMock.jennaProvider.findMany.mockResolvedValue([row({ apiKeyEnc: enc, apiKeyHint: 'QRST' })]);
    await jennaProviderKeyDelete(ctx('chat_anthropic').context);

    expect(infoSpy).toHaveBeenCalledTimes(1);
    const line = infoSpy.mock.calls[0].join(' ');
    expect(line).toContain('chat_anthropic');
    expect(line).toContain('u-0');
    expect(line).not.toContain(SECRET);
    expect(line).not.toContain(enc);
    expect(line).not.toContain('QRST');
  });
});
