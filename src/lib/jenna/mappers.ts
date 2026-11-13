// Row Prisma → DTO API. Satu-satunya jalur keluar data Jenna; apiKeyEnc tidak pernah ikut.
import type { JennaProvider, JennaSettings } from "@prisma/client";
import {
  JENNA_SLOT_PROTOCOL,
  JENNA_SLOTS,
  type JennaProviderDTO,
  type JennaSettingsDTO,
  type JennaSlot,
} from "./types";
import { isJennaChatProtocol } from "./validation";

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
    updatedAt: iso(row.updatedAt),
  };
}

export function toProviderDTO(slot: JennaSlot, row: JennaProvider | null): JennaProviderDTO {
  const hasApiKey = Boolean(row?.apiKeyEnc);
  const baseUrl = row?.baseUrl ?? "";
  const model = row?.model ?? "";
  return {
    slot,
    protocol: JENNA_SLOT_PROTOCOL[slot],
    baseUrl,
    model,
    temperature: row?.temperature ?? null,
    maxTokens: row?.maxTokens ?? null,
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

/** Semua slot dalam urutan JENNA_SLOTS; slot tanpa row tetap muncul (belum dikonfigurasi). */
export function toProviderDTOs(rows: readonly JennaProvider[]): JennaProviderDTO[] {
  return JENNA_SLOTS.map((slot) => toProviderDTO(slot, rows.find((r) => r.slot === slot) ?? null));
}
