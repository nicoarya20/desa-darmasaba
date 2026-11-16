// Row Prisma → DTO API. Satu-satunya jalur keluar data Jenna; apiKeyEnc tidak pernah ikut.
import type { JennaProvider, JennaSettings } from "@prisma/client";
import {
  JENNA_SLOT_PROTOCOL,
  JENNA_SLOTS,
  JENNA_VOICE_SLOT,
  type JennaProviderDTO,
  type JennaSettingsDTO,
  type JennaSlot,
  type JennaVoiceProviderDTO,
} from "./types";
import { isJennaChatProtocol, isJennaReasoningEffort } from "./validation";

export const JENNA_SETTINGS_ID = "global";

export const DEFAULT_JENNA_SETTINGS: Omit<JennaSettingsDTO, "updatedAt"> = {
  enabled: false,
  assistantName: "Jenna",
  personaNote: "",
  maxInputChars: 2000,
  historyWindow: 6,
  rateLimitPerMinute: 10,
  dailyMessagesUser: 100,
  dailyTokensGlobal: 0,
  retentionDays: 90,
  chatProtocol: "openai",
  voiceEnabled: false,
  voiceDailyMinutesUser: 5,
  voiceDailyMinutesGlobal: 0,
  voiceSessionMaxMinutes: 5,
  voiceIdleOffSeconds: 60,
  voiceName: "",
};

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

export function toSettingsDTO(row: JennaSettings | null): JennaSettingsDTO {
  if (!row) return { ...DEFAULT_JENNA_SETTINGS, updatedAt: null };
  return {
    enabled: row.enabled,
    assistantName: row.assistantName,
    personaNote: row.personaNote,
    maxInputChars: row.maxInputChars,
    historyWindow: row.historyWindow,
    rateLimitPerMinute: row.rateLimitPerMinute,
    dailyMessagesUser: row.dailyMessagesUser,
    dailyTokensGlobal: row.dailyTokensGlobal,
    retentionDays: row.retentionDays,
    chatProtocol: isJennaChatProtocol(row.chatProtocol) ? row.chatProtocol : DEFAULT_JENNA_SETTINGS.chatProtocol,
    voiceEnabled: row.voiceEnabled,
    voiceDailyMinutesUser: row.voiceDailyMinutesUser,
    voiceDailyMinutesGlobal: row.voiceDailyMinutesGlobal,
    voiceSessionMaxMinutes: row.voiceSessionMaxMinutes,
    voiceIdleOffSeconds: row.voiceIdleOffSeconds,
    voiceName: row.voiceName,
    updatedAt: iso(row.updatedAt),
  };
}

/** Field yang sama untuk provider chat & suara. */
function commonProviderFields(row: JennaProvider | null): Omit<JennaVoiceProviderDTO, "slot"> {
  const hasApiKey = Boolean(row?.apiKeyEnc);
  const baseUrl = row?.baseUrl ?? "";
  const model = row?.model ?? "";
  return {
    baseUrl,
    model,
    timeoutMs: row?.timeoutMs ?? 30000,
    hasApiKey,
    apiKeyHint: hasApiKey ? (row?.apiKeyHint ?? null) : null,
    ready: hasApiKey && baseUrl !== "" && model !== "",
    lastTestAt: iso(row?.lastTestAt),
    lastTestOk: row?.lastTestOk ?? null,
    lastTestMessage: row?.lastTestMessage ?? null,
    updatedAt: iso(row?.updatedAt),
  };
}

export function toProviderDTO(slot: JennaSlot, row: JennaProvider | null): JennaProviderDTO {
  return {
    slot,
    protocol: JENNA_SLOT_PROTOCOL[slot],
    ...commonProviderFields(row),
    temperature: row?.temperature ?? null,
    maxTokens: row?.maxTokens ?? null,
    reasoningEffort:
      JENNA_SLOT_PROTOCOL[slot] === "openai" && isJennaReasoningEffort(row?.reasoningEffort) ? row.reasoningEffort : null,
  };
}

export function toVoiceProviderDTO(row: JennaProvider | null): JennaVoiceProviderDTO {
  return { slot: JENNA_VOICE_SLOT, ...commonProviderFields(row) };
}

/** Semua slot dalam urutan JENNA_SLOTS; slot tanpa row tetap muncul (belum dikonfigurasi). */
export function toProviderDTOs(rows: readonly JennaProvider[]): JennaProviderDTO[] {
  return JENNA_SLOTS.map((slot) => toProviderDTO(slot, rows.find((r) => r.slot === slot) ?? null));
}
