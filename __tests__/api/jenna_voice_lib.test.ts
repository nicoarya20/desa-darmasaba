// @vitest-environment node
// Lib Jenna suara (fungsi murni): validasi setelan & provider suara, mapping DTO suara, tes koneksi gateway suara.
import { describe, expect, it, vi } from 'vitest';
import type { JennaProvider, JennaSettings } from '@prisma/client';
import { encryptSecret } from '@/lib/jenna/crypto';
import {
  VOICE_MODEL_ERROR,
  VOICE_NAME_ERROR,
  validateSettingsInput,
  validateVoiceProviderInput,
} from '@/lib/jenna/validation';
import { DEFAULT_JENNA_SETTINGS, toProviderDTOs, toSettingsDTO, toVoiceProviderDTO } from '@/lib/jenna/mappers';
import { buildConnectionTestRequest, describeVoiceHttpStatus, runConnectionTest } from '@/lib/jenna/connection-test';

const KEY = 'a'.repeat(64);
const SECRET = 'sk-voice-1234567890abcdWXYZ';

const voiceRow = (over: Partial<JennaProvider> = {}): JennaProvider => ({
  slot: 'voice',
  baseUrl: 'https://live.example.com/v1',
  apiKeyEnc: encryptSecret(SECRET, KEY),
  apiKeyHint: 'WXYZ',
  model: 'gpt-realtime',
  temperature: null,
  maxTokens: null,
  timeoutMs: 30000,
  lastTestAt: null,
  lastTestOk: null,
  lastTestMessage: null,
  updatedAt: new Date('2026-11-14T00:00:00Z'),
  updatedById: null,
  ...over,
});

describe('validateSettingsInput (suara)', () => {
  it('enam field suara valid diteruskan; voiceName di-trim', () => {
    const r = validateSettingsInput({
      voiceEnabled: true,
      voiceDailyMinutesUser: 5,
      voiceDailyMinutesGlobal: 0,
      voiceSessionMaxMinutes: 120,
      voiceIdleOffSeconds: 10,
      voiceName: '  alloy  ',
    });
    expect(r).toEqual({
      ok: true,
      value: {
        voiceEnabled: true,
        voiceDailyMinutesUser: 5,
        voiceDailyMinutesGlobal: 0,
        voiceSessionMaxMinutes: 120,
        voiceIdleOffSeconds: 10,
        voiceName: 'alloy',
      },
    });
  });

  it('voiceEnabled bukan boolean ditolak', () => {
    expect(validateSettingsInput({ voiceEnabled: 'ya' as unknown as boolean })).toEqual({
      ok: false,
      error: 'Status suara harus boolean.',
    });
  });

  it.each([
    ['voiceDailyMinutesUser', 0, 'Menit suara harian per pengunjung'],
    ['voiceDailyMinutesUser', 1441, 'Menit suara harian per pengunjung'],
    ['voiceDailyMinutesGlobal', -1, 'Menit suara harian global'],
    ['voiceDailyMinutesGlobal', 100_001, 'Menit suara harian global'],
    ['voiceSessionMaxMinutes', 0, 'Durasi maksimum sesi suara (menit)'],
    ['voiceSessionMaxMinutes', 121, 'Durasi maksimum sesi suara (menit)'],
    ['voiceIdleOffSeconds', 9, 'Tutup otomatis saat diam (detik)'],
    ['voiceIdleOffSeconds', 3601, 'Tutup otomatis saat diam (detik)'],
    ['voiceIdleOffSeconds', 30.5, 'Tutup otomatis saat diam (detik)'],
  ])('%s = %s ditolak dengan label "%s"', (field, value, label) => {
    const r = validateSettingsInput({ [field]: value });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(label);
  });

  it('voiceName kosong diizinkan (suara bawaan penyedia)', () => {
    expect(validateSettingsInput({ voiceName: '   ' })).toEqual({ ok: true, value: { voiceName: '' } });
  });

  it.each(['al loy', 'alloy!', 'x'.repeat(61), 'nama/suara'])('voiceName "%s" ditolak', (voiceName) => {
    expect(validateSettingsInput({ voiceName })).toEqual({ ok: false, error: VOICE_NAME_ERROR });
  });

  it.each(['alloy', 'Voice_1.2-b', 'x'.repeat(60)])('voiceName "%s" diterima', (voiceName) => {
    expect(validateSettingsInput({ voiceName }).ok).toBe(true);
  });
});

describe('validateVoiceProviderInput', () => {
  const base = { baseUrl: 'https://live.example.com/v1/', model: ' gpt-realtime ' };

  it('default timeout 30000, apiKey kosong = pertahankan (null), tanpa temperature/maxTokens', () => {
    const r = validateVoiceProviderInput({ ...base, apiKey: '  ' }, 'production');
    expect(r).toEqual({
      ok: true,
      value: { baseUrl: 'https://live.example.com/v1', model: 'gpt-realtime', timeoutMs: 30000, apiKey: null },
    });
  });

  it('apiKey & timeout valid dipertahankan; model dengan : dan / diterima', () => {
    const r = validateVoiceProviderInput(
      { ...base, model: 'openai/gpt-realtime:2025-08', timeoutMs: 15000, apiKey: SECRET },
      'production',
    );
    expect(r).toMatchObject({ ok: true, value: { model: 'openai/gpt-realtime:2025-08', timeoutMs: 15000, apiKey: SECRET } });
  });

  it.each(['', '   ', '-awal-strip', 'model spasi', 'x'.repeat(101)])('model "%s" ditolak', (model) => {
    expect(validateVoiceProviderInput({ ...base, model }, 'production')).toEqual({ ok: false, error: VOICE_MODEL_ERROR });
  });

  it('baseUrl, timeout, dan apiKey tidak valid ditolak', () => {
    expect(validateVoiceProviderInput({ ...base, baseUrl: 'http://evil.com' }, 'production').ok).toBe(false);
    expect(validateVoiceProviderInput({ ...base, timeoutMs: 999_999 }, 'production').ok).toBe(false);
    expect(validateVoiceProviderInput({ ...base, apiKey: 'sk a b' }, 'production')).toEqual({
      ok: false,
      error: 'API key tidak boleh memuat spasi.',
    });
  });
});

describe('mappers suara', () => {
  it('default setelan suara: nonaktif, kuota global 0, nama kosong', () => {
    expect(toSettingsDTO(null)).toMatchObject({
      voiceEnabled: false,
      voiceDailyMinutesUser: 5,
      voiceDailyMinutesGlobal: 0,
      voiceSessionMaxMinutes: 5,
      voiceIdleOffSeconds: 60,
      voiceName: '',
    });
  });

  it('row setelan → enam field suara terbawa', () => {
    const row = {
      id: 'global',
      ...DEFAULT_JENNA_SETTINGS,
      voiceEnabled: true,
      voiceDailyMinutesGlobal: 300,
      voiceName: 'alloy',
      updatedAt: new Date('2026-11-14T00:00:00Z'),
      updatedById: null,
    } as JennaSettings;
    expect(toSettingsDTO(row)).toMatchObject({ voiceEnabled: true, voiceDailyMinutesGlobal: 300, voiceName: 'alloy' });
  });

  it('toVoiceProviderDTO dengan row: slot voice, tanpa key/temperature/maxTokens/protocol', () => {
    const dto = toVoiceProviderDTO(voiceRow());
    const json = JSON.stringify(dto);
    expect(json).not.toContain(SECRET);
    expect(json).not.toContain('v1:');
    expect(dto).toEqual({
      slot: 'voice',
      baseUrl: 'https://live.example.com/v1',
      model: 'gpt-realtime',
      timeoutMs: 30000,
      hasApiKey: true,
      apiKeyHint: 'WXYZ',
      ready: true,
      lastTestAt: null,
      lastTestOk: null,
      lastTestMessage: null,
      updatedAt: '2026-11-14T00:00:00.000Z',
    });
  });

  it('toVoiceProviderDTO tanpa row → nilai kosong, belum siap', () => {
    expect(toVoiceProviderDTO(null)).toMatchObject({
      slot: 'voice',
      baseUrl: '',
      model: '',
      hasApiKey: false,
      apiKeyHint: null,
      ready: false,
      timeoutMs: 30000,
      updatedAt: null,
    });
  });

  it('toProviderDTOs mengabaikan row voice (providers tetap chat saja)', () => {
    const dtos = toProviderDTOs([voiceRow()]);
    expect(dtos.map((d) => d.slot)).toEqual(['chat_openai', 'chat_anthropic']);
    expect(dtos.every((d) => !d.hasApiKey && d.model === '')).toBe(true);
  });
});

describe('tes koneksi gateway suara', () => {
  const cfg = { baseUrl: 'https://live.example.com/v1/', model: 'gpt-realtime', apiKey: SECRET };

  it('GET {base}/models + Bearer, tanpa body', () => {
    const { url, init } = buildConnectionTestRequest('voice', cfg);
    expect(url).toBe('https://live.example.com/v1/models');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect((init.headers as Record<string, string>).authorization).toBe(`Bearer ${SECRET}`);
  });

  it('401/403 → ditolak; status lain (termasuk 404/500) → terjangkau', () => {
    expect(describeVoiceHttpStatus(401)).toEqual({ ok: false, message: 'Gateway menolak API key (HTTP 401).' });
    expect(describeVoiceHttpStatus(403)).toEqual({ ok: false, message: 'Gateway menolak API key (HTTP 403).' });
    for (const status of [200, 404, 500]) {
      expect(describeVoiceHttpStatus(status)).toEqual({
        ok: true,
        message: `Gateway terjangkau (HTTP ${status}). Negosiasi suara (SDP) baru teruji saat sesi suara pertama dipakai.`,
      });
    }
  });

  it('runConnectionTest slot voice memakai pesan gateway; body & key tidak bocor', async () => {
    const fetch404 = vi.fn(async () => new Response(`{"error":"no ${SECRET}"}`, { status: 404 }));
    const ok = await runConnectionTest('voice', { ...cfg, timeoutMs: 5000 }, fetch404 as unknown as typeof fetch);
    expect(ok.ok).toBe(true);
    expect(ok.message).toContain('Gateway terjangkau (HTTP 404)');

    const fetch401 = vi.fn(async () => new Response(`{"error":"bad ${SECRET}"}`, { status: 401 }));
    const bad = await runConnectionTest('voice', { ...cfg, timeoutMs: 5000 }, fetch401 as unknown as typeof fetch);
    expect(bad).toMatchObject({ ok: false, message: 'Gateway menolak API key (HTTP 401).' });
    expect(bad.message).not.toContain(SECRET);
  });

  it('chat_openai tetap memakai pesan chat (404 = gagal)', async () => {
    const fetch404 = vi.fn(async () => new Response('', { status: 404 }));
    const res = await runConnectionTest('chat_openai', { ...cfg, timeoutMs: 5000 }, fetch404 as unknown as typeof fetch);
    expect(res.ok).toBe(false);
  });
});
