// @vitest-environment node
// Logika murni halaman Developer › Jenna › Provider: status ringkas, Pengaturan lanjutan, Simpan & tes, saran model, prefill Base URL.
import { describe, expect, it } from 'vitest';
import { formatDateTime } from '@/app/dev/_com/format';
import {
  BASE_URL_PLACEHOLDER,
  DEFAULT_TIMEOUT_SEC,
  MODEL_PLACEHOLDER,
  hasAdvancedError,
  hasCustomAdvanced,
  modelSuggestions,
  providerEqual,
  providerErrors,
  providerFormFrom,
  providerStatus,
  saveRunsTest,
  type ProviderForm,
} from '@/app/dev/jenna/jenna-form.logic';
import { describeReasoning } from '@/lib/jenna/reasoning';
import { toProviderDTOs, toVoiceProviderDTO } from '@/lib/jenna/mappers';
import type { JennaProviderDTO } from '@/lib/jenna/types';

const [openaiEmpty, anthropicEmpty] = toProviderDTOs([]);
const ready = (over: Partial<JennaProviderDTO> = {}): JennaProviderDTO => ({
  ...openaiEmpty,
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-6-luna',
  hasApiKey: true,
  apiKeyHint: 'abcd',
  ready: true,
  ...over,
});
const AT = '2026-11-16T07:30:00.000Z';

describe('providerStatus', () => {
  it('belum lengkap menyebut bagian yang kurang', () => {
    expect(providerStatus(openaiEmpty)).toEqual({
      tone: 'orange',
      label: 'Belum lengkap',
      detail: 'Kurang: Base URL, model, API key.',
    });
    expect(providerStatus({ ...ready(), hasApiKey: false, ready: false }).detail).toBe('Kurang: API key.');
  });

  it('lengkap tanpa tes → Belum dites', () => {
    expect(providerStatus(ready())).toEqual({ tone: 'gray', label: 'Belum dites' });
  });

  it('tes berhasil / gagal memakai waktu tes terakhir; gagal membawa pesan', () => {
    expect(providerStatus(ready({ lastTestAt: AT, lastTestOk: true }))).toEqual({
      tone: 'green',
      label: `Siap dipakai · tes berhasil ${formatDateTime(AT)}`,
    });
    expect(providerStatus(ready({ lastTestAt: AT, lastTestOk: false, lastTestMessage: 'HTTP 401' }))).toEqual({
      tone: 'red',
      label: `Tes gagal · ${formatDateTime(AT)}`,
      detail: 'HTTP 401',
    });
  });

  it('sedang diuji mengalahkan status lain', () => {
    expect(providerStatus(openaiEmpty, true)).toEqual({ tone: 'blue', label: 'Menguji…' });
  });
});

describe('Pengaturan lanjutan', () => {
  const base = providerFormFrom(ready());

  it('tertutup bila semua nilai default, terbuka bila ada nilai tersimpan', () => {
    expect(base.timeoutSec).toBe(DEFAULT_TIMEOUT_SEC);
    expect(hasCustomAdvanced(base)).toBe(false);
    expect(hasCustomAdvanced(providerFormFrom(ready({ temperature: 0.3 })))).toBe(true);
    expect(hasCustomAdvanced(providerFormFrom(ready({ maxTokens: 512 })))).toBe(true);
    expect(hasCustomAdvanced(providerFormFrom(ready({ reasoningEffort: 'off' })))).toBe(true);
    expect(hasCustomAdvanced(providerFormFrom(ready({ timeoutMs: 45000 })))).toBe(true);
    expect(hasCustomAdvanced(providerFormFrom(toVoiceProviderDTO(null)))).toBe(false);
  });

  it('galat di field lanjutan memaksa terbuka; galat field utama tidak', () => {
    const bad = (over: Partial<ProviderForm>) => hasAdvancedError(providerErrors({ ...base, ...over }));
    expect(bad({})).toBe(false);
    expect(bad({ temperature: 9 })).toBe(true);
    expect(bad({ maxTokens: 1.5 })).toBe(true);
    expect(bad({ timeoutSec: '' })).toBe(true);
    expect(bad({ model: '' })).toBe(false);
  });
});

describe('saveRunsTest (label "Simpan & tes")', () => {
  const form = (over: Partial<ProviderForm> = {}) => ({ ...providerFormFrom(ready()), ...over });

  it('lengkap + kunci enkripsi → tes; kunci tersimpan atau diisi sama-sama dihitung', () => {
    expect(saveRunsTest(form(), { hasApiKey: true }, true)).toBe(true);
    expect(saveRunsTest(form({ apiKey: 'sk-baru' }), { hasApiKey: false }, true)).toBe(true);
  });

  it('kurang salah satu atau tanpa kunci enkripsi → simpan saja', () => {
    expect(saveRunsTest(form(), { hasApiKey: false }, true)).toBe(false);
    expect(saveRunsTest(form({ model: '  ' }), { hasApiKey: true }, true)).toBe(false);
    expect(saveRunsTest(form({ baseUrl: '' }), { hasApiKey: true }, true)).toBe(false);
    expect(saveRunsTest(form(), { hasApiKey: true }, false)).toBe(false);
  });
});

describe('saran model', () => {
  it('per protokol, suara tanpa saran; placeholder termasuk saran', () => {
    const openai = modelSuggestions(openaiEmpty).map((s) => s.value);
    const anthropic = modelSuggestions(anthropicEmpty).map((s) => s.value);
    expect(openai).toEqual(['gpt-6-luna', 'gpt-5.6-luna', 'gpt-5.4-nano', 'gpt-4o-mini']);
    expect(anthropic).toEqual(['claude-haiku-4-5', 'claude-haiku-5-5', 'claude-sonnet-5-5']);
    expect(openai).toContain(MODEL_PLACEHOLDER.openai);
    expect(anthropic).toContain(MODEL_PLACEHOLDER.anthropic);
    expect(modelSuggestions(toVoiceProviderDTO(null))).toEqual([]);
  });
});

describe('prefill Base URL', () => {
  it('slot chat kosong → URL resmi; tersimpan dipertahankan; suara tetap kosong', () => {
    expect(providerFormFrom(openaiEmpty).baseUrl).toBe(BASE_URL_PLACEHOLDER.openai);
    expect(providerFormFrom(anthropicEmpty).baseUrl).toBe(BASE_URL_PLACEHOLDER.anthropic);
    expect(providerFormFrom(ready({ baseUrl: 'https://proxy.example.com/v1' })).baseUrl).toBe(
      'https://proxy.example.com/v1',
    );
    expect(providerFormFrom(toVoiceProviderDTO(null)).baseUrl).toBe('');
  });

  it('prefill bagian dari baseline → form baru tidak dirty', () => {
    expect(providerEqual(providerFormFrom(openaiEmpty), providerFormFrom(openaiEmpty))).toBe(true);
  });
});

describe('describeReasoning tanpa backtick', () => {
  it.each([
    ['gpt-6-luna', null],
    ['o4-mini', null],
    ['gpt-4o-mini', 'medium'],
  ])('%s / %s', (model, setting) => {
    expect(describeReasoning(model, setting)).not.toContain('`');
  });
});
