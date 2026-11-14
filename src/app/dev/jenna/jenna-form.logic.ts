import {
  JENNA_PROVIDER_LIMITS,
  JENNA_SETTINGS_LIMITS,
  JENNA_VOICE_SLOT,
  type JennaProviderDTO,
  type JennaProviderUpdateInput,
  type JennaSettingsDTO,
  type JennaSettingsUpdateInput,
  type JennaVoiceProviderDTO,
  type JennaVoiceProviderUpdateInput,
} from '@/lib/jenna/types';
import {
  VOICE_MODEL_ERROR,
  VOICE_MODEL_PATTERN,
  VOICE_NAME_ERROR,
  VOICE_NAME_PATTERN,
  validateBaseUrl,
} from '@/lib/jenna/validation';

/** Nilai NumberInput Mantine: '' saat dikosongkan. */
export type NumberField = number | '';

type Range = { min: number; max: number };

/** Galat inline untuk angka wajib dalam rentang (bilangan bulat kecuali `allowDecimal`). */
export function rangeError(value: NumberField, range: Range, opts?: { allowDecimal?: boolean }): string | null {
  if (value === '') return 'Wajib diisi.';
  if (!opts?.allowDecimal && !Number.isInteger(value)) return 'Harus bilangan bulat.';
  if (value < range.min || value > range.max) return `Harus antara ${range.min} dan ${range.max}.`;
  return null;
}

// ---------------------------------------------------------------------------
// Identitas & Persona

export type IdentityForm = Pick<JennaSettingsDTO, 'assistantName' | 'personaNote'>;

export const identityFromSettings = (s: JennaSettingsDTO): IdentityForm => ({
  assistantName: s.assistantName,
  personaNote: s.personaNote,
});

export function identityErrors(form: IdentityForm): Partial<Record<keyof IdentityForm, string>> {
  const errors: Partial<Record<keyof IdentityForm, string>> = {};
  const name = form.assistantName.trim();
  const { minLength, maxLength } = JENNA_SETTINGS_LIMITS.assistantName;
  if (name.length < minLength) errors.assistantName = 'Nama asisten wajib diisi.';
  else if (name.length > maxLength) errors.assistantName = `Maksimal ${maxLength} karakter.`;
  if (form.personaNote.trim().length > JENNA_SETTINGS_LIMITS.personaNote.maxLength) {
    errors.personaNote = `Maksimal ${JENNA_SETTINGS_LIMITS.personaNote.maxLength} karakter.`;
  }
  return errors;
}

export const identityEqual = (a: IdentityForm, b: IdentityForm) =>
  a.assistantName.trim() === b.assistantName.trim() && a.personaNote.trim() === b.personaNote.trim();

// ---------------------------------------------------------------------------
// Batas Pemakaian

export const LIMIT_FIELDS = [
  {
    key: 'maxInputChars',
    label: 'Maks. karakter per pesan',
    hint: 'Pesan pengguna yang lebih panjang akan ditolak.',
    suffix: ' karakter',
  },
  {
    key: 'historyWindow',
    label: 'Jendela riwayat',
    hint: 'Jumlah pesan sebelumnya yang ikut dikirim sebagai konteks. 0 = tanpa riwayat.',
    suffix: ' pesan',
  },
  {
    key: 'rateLimitPerMinute',
    label: 'Batas pesan per menit',
    hint: 'Dihitung per sesi pengunjung dan per IP; mana yang lebih dulu tercapai. Mencegah spam.',
    suffix: ' pesan',
  },
  {
    key: 'dailyMessagesUser',
    label: 'Kuota pesan harian per pengunjung',
    hint: 'Dihitung per sesi pengunjung dan per IP; mana yang lebih dulu tercapai. Direset pukul 00.00 WIB.',
    suffix: ' pesan',
  },
  {
    key: 'dailyTokensGlobal',
    label: 'Kuota token harian (semua pengunjung)',
    hint: 'Batas total pemakaian token per hari, direset pukul 00.00 WIB. 0 = Jenna tidak aktif di website publik.',
    suffix: ' token',
  },
  {
    key: 'retentionDays',
    label: 'Retensi riwayat percakapan',
    hint: 'Percakapan yang lebih lama dari ini (sejak pesan terakhir) dihapus otomatis setiap hari (production).',
    suffix: ' hari',
  },
] as const;

export const VOICE_LIMIT_FIELDS = [
  {
    key: 'voiceDailyMinutesUser',
    label: 'Menit suara harian per pengunjung',
    hint: 'Jatah menit percakapan suara tiap pengunjung per hari.',
    suffix: ' menit',
  },
  {
    key: 'voiceDailyMinutesGlobal',
    label: 'Menit suara harian global',
    hint: 'Total menit suara semua pengunjung per hari. 0 = suara tidak aktif.',
    suffix: ' menit',
  },
  {
    key: 'voiceSessionMaxMinutes',
    label: 'Durasi maksimum sesi (menit)',
    hint: 'Satu sesi suara ditutup otomatis setelah durasi ini.',
    suffix: ' menit',
  },
  {
    key: 'voiceIdleOffSeconds',
    label: 'Tutup otomatis saat diam (detik)',
    hint: 'Sesi suara ditutup bila pengunjung diam selama ini.',
    suffix: ' detik',
  },
] as const;

export type LimitField = (typeof LIMIT_FIELDS)[number] | (typeof VOICE_LIMIT_FIELDS)[number];
export type LimitKey = LimitField['key'];
/** `voiceName` hanya ada pada preset suara. */
export type LimitsForm = Partial<Record<LimitKey, NumberField>> & { voiceName?: string };
export type LimitsErrors = Partial<Record<LimitKey | 'voiceName', string>>;

/** Isi kartu batas pemakaian: chat (Batas Pemakaian) atau suara (Batas Suara). */
export type LimitsPreset = {
  section: 'limits' | 'voiceLimits';
  title: string;
  description: string;
  successMessage: string;
  fields: readonly LimitField[];
  withVoiceName: boolean;
};

export const LIMITS_PRESETS = {
  chat: {
    section: 'limits',
    title: 'Batas Pemakaian',
    description: 'Mencegah penyalahgunaan dan mengendalikan biaya provider.',
    successMessage: 'Batas pemakaian disimpan.',
    fields: LIMIT_FIELDS,
    withVoiceName: false,
  },
  voice: {
    section: 'voiceLimits',
    title: 'Batas Suara',
    description: 'Mengendalikan pemakaian dan biaya suara realtime. Berlaku saat fitur suara tersedia.',
    successMessage: 'Batas suara disimpan.',
    fields: VOICE_LIMIT_FIELDS,
    withVoiceName: true,
  },
} as const satisfies Record<string, LimitsPreset>;

export function limitsFromSettings(s: JennaSettingsDTO, preset: LimitsPreset = LIMITS_PRESETS.chat): LimitsForm {
  const form: LimitsForm = Object.fromEntries(preset.fields.map(({ key }) => [key, s[key]]));
  if (preset.withVoiceName) form.voiceName = s.voiceName;
  return form;
}

export function limitsErrors(form: LimitsForm, preset: LimitsPreset = LIMITS_PRESETS.chat): LimitsErrors {
  const errors: LimitsErrors = {};
  for (const { key } of preset.fields) {
    const error = rangeError(form[key] ?? '', JENNA_SETTINGS_LIMITS[key]);
    if (error) errors[key] = error;
  }
  const voiceName = form.voiceName?.trim() ?? '';
  if (preset.withVoiceName && voiceName !== '' && !VOICE_NAME_PATTERN.test(voiceName)) errors.voiceName = VOICE_NAME_ERROR;
  return errors;
}

export const limitsEqual = (a: LimitsForm, b: LimitsForm, preset: LimitsPreset = LIMITS_PRESETS.chat) =>
  preset.fields.every(({ key }) => a[key] === b[key]) && (a.voiceName?.trim() ?? '') === (b.voiceName?.trim() ?? '');

/** Hanya dipanggil saat tidak ada galat (semua angka terisi). */
export function limitsPayload(form: LimitsForm, preset: LimitsPreset = LIMITS_PRESETS.chat): JennaSettingsUpdateInput {
  const payload: JennaSettingsUpdateInput = Object.fromEntries(preset.fields.map(({ key }) => [key, form[key]]));
  if (preset.withVoiceName) payload.voiceName = form.voiceName?.trim() ?? '';
  return payload;
}

// ---------------------------------------------------------------------------
// Provider

export type ProviderForm = {
  baseUrl: string;
  model: string;
  temperature: NumberField;
  maxTokens: NumberField;
  /** Ditampilkan dalam detik; API memakai milidetik. */
  timeoutSec: NumberField;
  /** Kosong = pertahankan kunci tersimpan. */
  apiKey: string;
};

export const TIMEOUT_SEC_RANGE: Range = {
  min: JENNA_PROVIDER_LIMITS.timeoutMs.min / 1000,
  max: JENNA_PROVIDER_LIMITS.timeoutMs.max / 1000,
};

export const BASE_URL_PLACEHOLDER: Record<JennaProviderDTO['protocol'], string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
};

export const MODEL_PLACEHOLDER: Record<JennaProviderDTO['protocol'], string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-haiku-4-5',
};

export type AnyProviderDTO = JennaProviderDTO | JennaVoiceProviderDTO;

export const isVoiceProvider = (p: Pick<AnyProviderDTO, 'slot'>): p is JennaVoiceProviderDTO =>
  p.slot === JENNA_VOICE_SLOT;

/** Teks form provider per slot. */
export type ProviderCopy = {
  baseUrlDescription: string;
  baseUrlPlaceholder: string;
  modelLabel: string;
  modelDescription: string;
  modelPlaceholder: string;
};

export function providerCopy(p: AnyProviderDTO): ProviderCopy {
  if (isVoiceProvider(p)) {
    return {
      baseUrlDescription: 'Endpoint gateway suara realtime. Wajib https.',
      baseUrlPlaceholder: 'https://live.example.com/v1',
      modelLabel: 'Model suara',
      modelDescription: 'ID model suara realtime persis seperti di dokumentasi gateway.',
      modelPlaceholder: 'gpt-realtime',
    };
  }
  return {
    baseUrlDescription:
      p.protocol === 'openai'
        ? 'Endpoint OpenAI atau layanan yang kompatibel. Wajib https.'
        : 'Endpoint Anthropic Messages API. Wajib https.',
    baseUrlPlaceholder: BASE_URL_PLACEHOLDER[p.protocol],
    modelLabel: 'Model',
    modelDescription: 'ID model persis seperti di dokumentasi provider.',
    modelPlaceholder: MODEL_PLACEHOLDER[p.protocol],
  };
}

export function providerFormFrom(p: AnyProviderDTO): ProviderForm {
  const voice = isVoiceProvider(p);
  return {
    baseUrl: p.baseUrl,
    model: p.model,
    temperature: voice ? '' : (p.temperature ?? ''),
    maxTokens: voice ? '' : (p.maxTokens ?? ''),
    timeoutSec: p.timeoutMs / 1000,
    apiKey: '',
  };
}

function modelError(model: string, voice: boolean): string | null {
  if (model.length < JENNA_PROVIDER_LIMITS.model.minLength) return voice ? 'Model suara wajib diisi.' : 'Model wajib diisi.';
  if (voice) return VOICE_MODEL_PATTERN.test(model) ? null : VOICE_MODEL_ERROR;
  if (model.length > JENNA_PROVIDER_LIMITS.model.maxLength) return `Maksimal ${JENNA_PROVIDER_LIMITS.model.maxLength} karakter.`;
  return null;
}

/** `voice`: aturan model suara; temperature & maxTokens tidak dipakai. */
export function providerErrors(form: ProviderForm, voice = false): Partial<Record<keyof ProviderForm, string>> {
  const errors: Partial<Record<keyof ProviderForm, string>> = {};
  if (form.baseUrl.trim() === '') errors.baseUrl = 'Base URL wajib diisi.';
  else {
    const url = validateBaseUrl(form.baseUrl, process.env.NODE_ENV ?? 'production');
    if (!url.ok) errors.baseUrl = url.error;
  }
  const model = modelError(form.model.trim(), voice);
  if (model) errors.model = model;
  if (form.temperature !== '') {
    const error = rangeError(form.temperature, JENNA_PROVIDER_LIMITS.temperature, { allowDecimal: true });
    if (error) errors.temperature = error;
  }
  if (form.maxTokens !== '') {
    const error = rangeError(form.maxTokens, JENNA_PROVIDER_LIMITS.maxTokens);
    if (error) errors.maxTokens = error;
  }
  const timeoutError = rangeError(form.timeoutSec, TIMEOUT_SEC_RANGE, { allowDecimal: true });
  if (timeoutError) errors.timeoutSec = timeoutError;
  const apiKey = form.apiKey.trim();
  if (apiKey.length > JENNA_PROVIDER_LIMITS.apiKey.maxLength) {
    errors.apiKey = `Maksimal ${JENNA_PROVIDER_LIMITS.apiKey.maxLength} karakter.`;
  } else if (/\s/.test(apiKey)) errors.apiKey = 'API key tidak boleh memuat spasi.';
  return errors;
}

export const providerEqual = (a: ProviderForm, b: ProviderForm) =>
  a.baseUrl.trim() === b.baseUrl.trim() &&
  a.model.trim() === b.model.trim() &&
  a.temperature === b.temperature &&
  a.maxTokens === b.maxTokens &&
  a.timeoutSec === b.timeoutSec &&
  a.apiKey.trim() === b.apiKey.trim();

export function providerPayload(form: ProviderForm): JennaProviderUpdateInput {
  return {
    ...voiceProviderPayload(form),
    temperature: form.temperature === '' ? null : form.temperature,
    maxTokens: form.maxTokens === '' ? null : form.maxTokens,
  };
}

export function voiceProviderPayload(form: ProviderForm): JennaVoiceProviderUpdateInput {
  const apiKey = form.apiKey.trim();
  return {
    baseUrl: form.baseUrl.trim(),
    model: form.model.trim(),
    timeoutMs: Math.round(Number(form.timeoutSec) * 1000),
    ...(apiKey ? { apiKey } : {}),
  };
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
