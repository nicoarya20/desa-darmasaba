// @vitest-environment node
import { randomBytes } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const KEY = randomBytes(32).toString('hex');
const mocks = vi.hoisted(() => ({
  env: { NODE_ENV: 'production', JENNA_CREDENTIALS_KEY: '' as string | undefined },
  settings: vi.fn(),
  provider: vi.fn(),
}));

vi.mock('@/lib/env', () => ({ env: mocks.env }));
vi.mock('@/lib/prisma', () => ({
  default: { jennaSettings: { findUnique: mocks.settings }, jennaProvider: { findUnique: mocks.provider } },
}));

import { encryptSecret } from '@/lib/jenna/crypto';
import {
  invalidateJennaRuntimeCache,
  JENNA_RUNTIME_CACHE_TTL_MS,
  resolveActiveProvider,
} from '@/lib/jenna/provider/active';
import { AnthropicProvider } from '@/lib/jenna/provider/anthropic';
import { OpenAICompatibleProvider } from '@/lib/jenna/provider/openai-compatible';

const row = (over: Record<string, unknown> = {}) => ({
  slot: 'chat_openai',
  baseUrl: 'https://oai.example/v1',
  model: 'gpt-test',
  apiKeyEnc: encryptSecret('sk-test', KEY),
  temperature: null,
  maxTokens: null,
  reasoningEffort: null,
  timeoutMs: 5000,
  ...over,
});

beforeEach(() => {
  invalidateJennaRuntimeCache();
  mocks.env.JENNA_CREDENTIALS_KEY = KEY;
  mocks.settings.mockReset().mockResolvedValue(null);
  mocks.provider.mockReset().mockResolvedValue(row());
});

describe('resolveActiveProvider', () => {
  it('slot dari chatProtocol; provider siap dengan model', async () => {
    const res = await resolveActiveProvider(0);
    expect(mocks.provider).toHaveBeenCalledWith({ where: { slot: 'chat_openai' } });
    expect(res).toMatchObject({ slot: 'chat_openai', model: 'gpt-test' });
    expect('provider' in res && res.provider).toBeInstanceOf(OpenAICompatibleProvider);
  });

  it('reasoningEffort row diteruskan ke config adapter', async () => {
    mocks.provider.mockResolvedValue(row({ reasoningEffort: 'none' }));
    const res = await resolveActiveProvider(0);
    const config = 'provider' in res ? (res.provider as unknown as { config: { reasoningEffort: unknown } }).config : null;
    expect(config?.reasoningEffort).toBe('none');
  });

  it('protokol anthropic memakai slot chat_anthropic', async () => {
    mocks.settings.mockResolvedValue({ id: 'global', chatProtocol: 'anthropic', updatedAt: new Date() });
    mocks.provider.mockResolvedValue(row({ slot: 'chat_anthropic' }));
    const res = await resolveActiveProvider(0);
    expect(mocks.provider).toHaveBeenCalledWith({ where: { slot: 'chat_anthropic' } });
    expect('provider' in res && res.provider).toBeInstanceOf(AnthropicProvider);
  });

  it('alasan belum siap', async () => {
    const cases: Array<[() => void, string]> = [
      [() => mocks.provider.mockResolvedValue(null), 'not_configured'],
      [() => mocks.provider.mockResolvedValue(row({ apiKeyEnc: null })), 'not_configured'],
      [() => mocks.provider.mockResolvedValue(row({ baseUrl: 'http://oai.example' })), 'invalid_base_url'],
      [() => (mocks.env.JENNA_CREDENTIALS_KEY = undefined), 'crypto_not_configured'],
      [() => (mocks.env.JENNA_CREDENTIALS_KEY = randomBytes(32).toString('hex')), 'decrypt_failed'],
    ];
    for (const [setup, reason] of cases) {
      invalidateJennaRuntimeCache();
      mocks.env.JENNA_CREDENTIALS_KEY = KEY;
      mocks.provider.mockResolvedValue(row());
      setup();
      const res = await resolveActiveProvider(0);
      expect(res).toMatchObject({ notReady: reason });
      expect('settings' in res && res.settings.chatProtocol).toBe('openai');
    }
  });

  it('cache 30 detik, muat paralel di-dedupe, invalidate memaksa muat ulang', async () => {
    await Promise.all([resolveActiveProvider(0), resolveActiveProvider(0)]);
    expect(mocks.provider).toHaveBeenCalledTimes(1);
    await resolveActiveProvider(JENNA_RUNTIME_CACHE_TTL_MS - 1);
    expect(mocks.provider).toHaveBeenCalledTimes(1);
    await resolveActiveProvider(JENNA_RUNTIME_CACHE_TTL_MS);
    expect(mocks.provider).toHaveBeenCalledTimes(2);
    invalidateJennaRuntimeCache();
    await resolveActiveProvider(JENNA_RUNTIME_CACHE_TTL_MS);
    expect(mocks.provider).toHaveBeenCalledTimes(3);
  });

  it('muat yang dimulai sebelum invalidate tidak menimpa cache', async () => {
    let release!: (v: unknown) => void;
    mocks.provider.mockReturnValueOnce(new Promise((r) => (release = r)));
    const stale = resolveActiveProvider(0);
    invalidateJennaRuntimeCache();
    mocks.provider.mockResolvedValue(row({ model: 'baru' }));
    const fresh = await resolveActiveProvider(0);
    release(row({ model: 'lama' }));
    expect(await stale).toMatchObject({ model: 'lama' });
    expect(fresh).toMatchObject({ model: 'baru' });
    expect(await resolveActiveProvider(1)).toMatchObject({ model: 'baru' });
  });
});
