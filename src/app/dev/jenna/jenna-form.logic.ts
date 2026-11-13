import {
  JENNA_PROVIDER_LIMITS,
  JENNA_SETTINGS_LIMITS,
  type JennaProviderDTO,
  type JennaProviderUpdateInput,
  type JennaSettingsDTO,
} from '@/lib/jenna/types';
import { validateBaseUrl } from '@/lib/jenna/validation';

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
    hint: 'Per pengguna, untuk mencegah spam.',
    suffix: ' pesan',
  },
  {
    key: 'dailyMessagesUser',
    label: 'Kuota pesan harian per pengguna',
    hint: 'Direset setiap hari.',
    suffix: ' pesan',
  },
  {
    key: 'dailyTokensGlobal',
    label: 'Kuota token harian (semua pengguna)',
    hint: 'Batas total pemakaian token per hari. 0 = tanpa batas.',
    suffix: ' token',
  },
  {
    key: 'retentionDays',
    label: 'Retensi riwayat percakapan',
    hint: 'Lama riwayat percakapan disimpan.',
    suffix: ' hari',
  },
] as const;

export type LimitKey = (typeof LIMIT_FIELDS)[number]['key'];
export type LimitsForm = Record<LimitKey, NumberField>;

export function limitsFromSettings(s: JennaSettingsDTO): LimitsForm {
  return Object.fromEntries(LIMIT_FIELDS.map(({ key }) => [key, s[key]])) as LimitsForm;
}

export function limitsErrors(form: LimitsForm): Partial<Record<LimitKey, string>> {
  const errors: Partial<Record<LimitKey, string>> = {};
  for (const { key } of LIMIT_FIELDS) {
    const error = rangeError(form[key], JENNA_SETTINGS_LIMITS[key]);
    if (error) errors[key] = error;
  }
  return errors;
}

export const limitsEqual = (a: LimitsForm, b: LimitsForm) => LIMIT_FIELDS.every(({ key }) => a[key] === b[key]);

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

export function providerFormFrom(p: JennaProviderDTO): ProviderForm {
  return {
    baseUrl: p.baseUrl,
    model: p.model,
    temperature: p.temperature ?? '',
    maxTokens: p.maxTokens ?? '',
    timeoutSec: p.timeoutMs / 1000,
    apiKey: '',
  };
}

export function providerErrors(form: ProviderForm): Partial<Record<keyof ProviderForm, string>> {
  const errors: Partial<Record<keyof ProviderForm, string>> = {};
  if (form.baseUrl.trim() === '') errors.baseUrl = 'Base URL wajib diisi.';
  else {
    const url = validateBaseUrl(form.baseUrl, process.env.NODE_ENV ?? 'production');
    if (!url.ok) errors.baseUrl = url.error;
  }
  const model = form.model.trim();
  if (model.length < JENNA_PROVIDER_LIMITS.model.minLength) errors.model = 'Model wajib diisi.';
  else if (model.length > JENNA_PROVIDER_LIMITS.model.maxLength) {
    errors.model = `Maksimal ${JENNA_PROVIDER_LIMITS.model.maxLength} karakter.`;
  }
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
  const apiKey = form.apiKey.trim();
  return {
    baseUrl: form.baseUrl.trim(),
    model: form.model.trim(),
    temperature: form.temperature === '' ? null : form.temperature,
    maxTokens: form.maxTokens === '' ? null : form.maxTokens,
    timeoutMs: Math.round(Number(form.timeoutSec) * 1000),
    ...(apiKey ? { apiKey } : {}),
  };
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
