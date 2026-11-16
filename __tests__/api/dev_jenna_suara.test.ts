// @vitest-environment node
// Developer › Jenna › Suara: logika murni (peringatan sakelar, preset Batas Suara, form provider suara) dan aksi
// store provider suara lewat fetch tiruan.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { toastMock } = vi.hoisted(() => ({ toastMock: { success: vi.fn(), error: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: toastMock }));

import jennaState from '@/app/dev/_state/jenna-state';
import { voiceSwitchWarnings } from '@/app/dev/jenna/suara/suara.logic';
import {
  LIMITS_PRESETS,
  limitsEqual,
  limitsErrors,
  limitsFromSettings,
  limitsPayload,
  providerCopy,
  providerEqual,
  providerErrors,
  providerFormFrom,
  providerPayload,
  voiceProviderPayload,
  type ProviderForm,
} from '@/app/dev/jenna/jenna-form.logic';
import { toProviderDTOs, toSettingsDTO, toVoiceProviderDTO } from '@/lib/jenna/mappers';
import type { JennaConfigResponse, JennaProviderDTO, JennaVoiceProviderDTO } from '@/lib/jenna/types';

const voiceDTO = (over: Partial<JennaVoiceProviderDTO> = {}): JennaVoiceProviderDTO => ({
  ...toVoiceProviderDTO(null),
  baseUrl: 'https://live.example.com/v1',
  model: 'gpt-realtime',
  ...over,
});

const config = (over: Partial<JennaConfigResponse> = {}): JennaConfigResponse => ({
  settings: toSettingsDTO(null),
  providers: toProviderDTOs([]),
  voiceProvider: voiceDTO(),
  cryptoConfigured: true,
  updatedBy: null,
  ...over,
});

const ok = (data: unknown) =>
  new Response(JSON.stringify({ success: true, data }), { headers: { 'content-type': 'application/json' } });
const fail = (status: number, message: string) =>
  new Response(JSON.stringify({ success: false, message }), { status, headers: { 'content-type': 'application/json' } });

describe('voiceSwitchWarnings', () => {
  const ready = { voiceEnabled: true, voiceProviderReady: true, voiceDailyMinutesGlobal: 100, chatEnabled: true };

  it('sakelar mati → tanpa peringatan walau belum siap', () => {
    expect(
      voiceSwitchWarnings({ voiceEnabled: false, voiceProviderReady: false, voiceDailyMinutesGlobal: 0, chatEnabled: false }),
    ).toEqual([]);
  });

  it('menyala & semua siap → tanpa peringatan', () => {
    expect(voiceSwitchWarnings(ready)).toEqual([]);
  });

  it('menyala tapi belum siap → tiga peringatan sesuai urutan', () => {
    expect(
      voiceSwitchWarnings({ voiceEnabled: true, voiceProviderReady: false, voiceDailyMinutesGlobal: 0, chatEnabled: false }),
    ).toEqual([
      'Suara belum bisa dipakai: provider suara belum siap.',
      'Kuota menit suara harian global masih 0.',
      'Jenna chat sedang nonaktif.',
    ]);
    expect(voiceSwitchWarnings({ ...ready, voiceDailyMinutesGlobal: 0 })).toEqual(['Kuota menit suara harian global masih 0.']);
  });
});

describe('preset Batas Suara', () => {
  const preset = LIMITS_PRESETS.voice;
  const settings = { ...toSettingsDTO(null), voiceName: 'alloy' };

  it('form hanya berisi empat field suara + voiceName; payload di-trim', () => {
    const form = limitsFromSettings(settings, preset);
    expect(form).toEqual({
      voiceDailyMinutesUser: 5,
      voiceDailyMinutesGlobal: 0,
      voiceSessionMaxMinutes: 5,
      voiceIdleOffSeconds: 60,
      voiceName: 'alloy',
    });
    expect(limitsPayload({ ...form, voiceName: '  verse ' }, preset)).toEqual({ ...form, voiceName: 'verse' });
  });

  it('preset chat tidak membawa field suara', () => {
    const form = limitsFromSettings(settings);
    expect(form).not.toHaveProperty('voiceName');
    expect(form).not.toHaveProperty('voiceDailyMinutesUser');
    expect(limitsPayload(form)).not.toHaveProperty('voiceName');
  });

  it('galat rentang & nama suara; nama kosong boleh', () => {
    const form = limitsFromSettings(settings, preset);
    expect(limitsErrors(form, preset)).toEqual({});
    expect(limitsErrors({ ...form, voiceName: '' }, preset)).toEqual({});
    const errors = limitsErrors({ ...form, voiceDailyMinutesUser: 0, voiceIdleOffSeconds: '', voiceName: 'al loy' }, preset);
    expect(Object.keys(errors).sort()).toEqual(['voiceDailyMinutesUser', 'voiceIdleOffSeconds', 'voiceName']);
  });

  it('dirty: perubahan nama (selain spasi) terdeteksi', () => {
    const form = limitsFromSettings(settings, preset);
    expect(limitsEqual({ ...form, voiceName: ' alloy ' }, form, preset)).toBe(true);
    expect(limitsEqual({ ...form, voiceName: 'verse' }, form, preset)).toBe(false);
    expect(limitsEqual({ ...form, voiceSessionMaxMinutes: 10 }, form, preset)).toBe(false);
  });
});

describe('form provider suara', () => {
  const form = (over: Partial<ProviderForm> = {}): ProviderForm => ({ ...providerFormFrom(voiceDTO()), ...over });

  it('teks & form dari DTO suara: tanpa temperature/maxTokens', () => {
    expect(providerCopy(voiceDTO())).toMatchObject({
      modelLabel: 'Model suara',
      baseUrlPlaceholder: 'https://live.example.com/v1',
    });
    expect(form()).toEqual({
      baseUrl: 'https://live.example.com/v1',
      model: 'gpt-realtime',
      temperature: '',
      maxTokens: '',
      reasoningEffort: '',
      timeoutSec: 30,
      apiKey: '',
    });
  });

  it('payload: trim, detik → ms, apiKey kosong tidak dikirim', () => {
    expect(voiceProviderPayload(form({ baseUrl: ' https://live.example.com/v1 ', timeoutSec: 12.5 }))).toEqual({
      baseUrl: 'https://live.example.com/v1',
      model: 'gpt-realtime',
      timeoutMs: 12500,
    });
    expect(voiceProviderPayload(form({ apiKey: ' sk-x ' }))).toMatchObject({ apiKey: 'sk-x' });
    expect(voiceProviderPayload(form())).not.toHaveProperty('temperature');
    expect(voiceProviderPayload(form())).not.toHaveProperty('reasoningEffort');
  });

  it('galat model memakai aturan suara', () => {
    expect(providerErrors(form(), true)).toEqual({});
    expect(providerErrors(form({ model: '' }), true).model).toBe('Model suara wajib diisi.');
    expect(providerErrors(form({ model: 'model spasi' }), true).model).toBe('Model suara tidak valid.');
    expect(providerErrors(form({ model: 'model spasi' })).model).toBeUndefined();
  });
});

describe('form provider chat: reasoningEffort', () => {
  const openaiDTO = (over: Partial<JennaProviderDTO> = {}): JennaProviderDTO => ({ ...toProviderDTOs([])[0], ...over });

  it('DTO → form (null = ""), dirty terdeteksi, payload "" → null', () => {
    const empty = providerFormFrom(openaiDTO());
    expect(empty.reasoningEffort).toBe('');
    expect(providerPayload(empty).reasoningEffort).toBeNull();

    const filled = providerFormFrom(openaiDTO({ reasoningEffort: 'none' }));
    expect(filled.reasoningEffort).toBe('none');
    expect(providerPayload(filled).reasoningEffort).toBe('none');
    expect(providerEqual(filled, empty)).toBe(false);
    expect(providerEqual({ ...empty, reasoningEffort: 'none' }, filled)).toBe(true);
  });

  it('"off" (Jangan kirim) bolak-balik DTO → form → payload dan beda dari Otomatis', () => {
    const off = providerFormFrom(openaiDTO({ reasoningEffort: 'off' }));
    expect(off.reasoningEffort).toBe('off');
    expect(providerPayload(off).reasoningEffort).toBe('off');
    expect(providerEqual(off, providerFormFrom(openaiDTO()))).toBe(false);
  });
});

describe('aksi store provider suara', () => {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>();
  const lastCall = () => {
    const [url, init] = fetchMock.mock.calls.at(-1)!;
    return { url, method: init?.method, body: init?.body ? JSON.parse(init.body as string) : undefined };
  };

  beforeEach(() => {
    fetchMock.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    jennaState.config = config();
    jennaState.saving = null;
    jennaState.testingSlot = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('saveVoiceProvider: PUT /voice/provider, config diganti, toast sukses', async () => {
    const next = config({ voiceProvider: voiceDTO({ hasApiKey: true, apiKeyHint: 'WXYZ', ready: true }) });
    fetchMock.mockResolvedValueOnce(ok(next));
    const input = { baseUrl: 'https://live.example.com/v1', model: 'gpt-realtime', timeoutMs: 30000, apiKey: 'sk-x' };
    const promise = jennaState.saveVoiceProvider(input);
    expect(jennaState.saving).toBe('voice');
    await expect(promise).resolves.toEqual(next);

    expect(lastCall()).toEqual({ url: '/api/developer/jenna/voice/provider', method: 'PUT', body: input });
    expect(jennaState.config?.voiceProvider.ready).toBe(true);
    expect(jennaState.saving).toBeNull();
    expect(toastMock.success).toHaveBeenCalledWith('Provider suara disimpan.');
  });

  it('saveVoiceProvider gagal → null, config tetap, pesan server ditampilkan', async () => {
    const before = jennaState.config;
    fetchMock.mockResolvedValueOnce(fail(400, 'Model suara tidak valid.'));
    await expect(jennaState.saveVoiceProvider({ baseUrl: 'https://x.example', model: '!' })).resolves.toBeNull();
    expect(jennaState.config).toBe(before);
    expect(toastMock.error).toHaveBeenCalledWith('Model suara tidak valid.');
    expect(jennaState.saving).toBeNull();
  });

  it('deleteVoiceProviderKey: DELETE /voice/provider/key tanpa body', async () => {
    fetchMock.mockResolvedValueOnce(ok(config()));
    await jennaState.deleteVoiceProviderKey();
    expect(lastCall()).toEqual({ url: '/api/developer/jenna/voice/provider/key', method: 'DELETE', body: undefined });
    expect(toastMock.success).toHaveBeenCalledWith('API key suara dihapus.');
  });

  it('testVoiceProvider: POST /voice/provider/test, voiceProvider diperbarui, providers chat tidak disentuh', async () => {
    const providersBefore = jennaState.config!.providers;
    const tested = voiceDTO({ lastTestOk: true, lastTestMessage: 'Gateway terjangkau (HTTP 200).' });
    fetchMock.mockResolvedValueOnce(
      ok({ ok: true, message: 'Gateway terjangkau (HTTP 200).', latencyMs: 42, testedAt: '2026-11-14T00:00:00.000Z', provider: tested }),
    );
    const promise = jennaState.testVoiceProvider();
    expect(jennaState.testingSlot).toBe('voice');
    await expect(promise).resolves.toMatchObject({ ok: true, latencyMs: 42 });

    expect(lastCall()).toMatchObject({ url: '/api/developer/jenna/voice/provider/test', method: 'POST' });
    expect(jennaState.config?.voiceProvider).toEqual(tested);
    expect(jennaState.config?.providers).toEqual(providersBefore);
    expect(jennaState.testingSlot).toBeNull();
    expect(toastMock.success).toHaveBeenCalledWith('Koneksi berhasil (42 ms).');
  });

  it('testVoiceProvider hasil gagal → toast galat dengan pesan gateway', async () => {
    fetchMock.mockResolvedValueOnce(
      ok({ ok: false, message: 'Gateway menolak API key (HTTP 401).', latencyMs: 5, testedAt: '2026-11-14T00:00:00.000Z', provider: voiceDTO() }),
    );
    await jennaState.testVoiceProvider();
    expect(toastMock.error).toHaveBeenCalledWith('Koneksi gagal: Gateway menolak API key (HTTP 401).');
  });

  it('testVoiceProvider tanpa row → null, pesan 400 server ditampilkan', async () => {
    fetchMock.mockResolvedValueOnce(fail(400, 'Provider suara belum disimpan. Simpan konfigurasi provider suara terlebih dahulu.'));
    await expect(jennaState.testVoiceProvider()).resolves.toBeNull();
    expect(toastMock.error).toHaveBeenCalledWith(
      'Provider suara belum disimpan. Simpan konfigurasi provider suara terlebih dahulu.',
    );
    expect(jennaState.testingSlot).toBeNull();
  });
});
