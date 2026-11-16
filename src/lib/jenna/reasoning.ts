// Reasoning effort efektif slot chat_openai (fungsi murni, client-safe): dipakai adapter, tes koneksi, dan form.
import { JENNA_REASONING_EFFORT_VALUES, type JennaReasoningEffortValue } from "./types";

// gpt-5.x dan gpt-6+ menerima `none` (tools di Chat Completions butuh `none`); gpt-5 polos & seri o menolak `none`.
const AUTO_RULES: ReadonlyArray<{ pattern: RegExp; effort: JennaReasoningEffortValue }> = [
  { pattern: /^gpt-(?:[6-9]|[1-9]\d)(?:[.-]|$)/, effort: "none" },
  { pattern: /^gpt-5\.\d/, effort: "none" },
  { pattern: /^gpt-5(?:-|$)/, effort: "low" },
  { pattern: /^o\d+(?:-|$)/, effort: "low" },
];

const isEffortValue = (value: unknown): value is JennaReasoningEffortValue =>
  typeof value === "string" && (JENNA_REASONING_EFFORT_VALUES as readonly string[]).includes(value);

/** Nilai Otomatis dari nama model (trim, tanpa beda huruf besar/kecil, prefix seperti `openai/` tidak dibuang). */
export function autoReasoningEffort(model: string): JennaReasoningEffortValue | null {
  const name = model.trim().toLowerCase();
  return AUTO_RULES.find((rule) => rule.pattern.test(name))?.effort ?? null;
}

/**
 * Nilai `reasoning_effort` yang dikirim, atau null = tidak dikirim (pakai `max_tokens`).
 * Setelan null/tak dikenal = Otomatis (sama dengan DTO yang memetakan nilai asing ke null).
 */
export function resolveReasoningEffort(
  model: string,
  setting: string | null | undefined,
): JennaReasoningEffortValue | null {
  if (setting === "off") return null;
  if (isEffortValue(setting)) return setting;
  return autoReasoningEffort(model);
}

/** Keterangan singkat untuk form: apa yang dikirim untuk model & setelan ini. */
export function describeReasoning(model: string, setting: string | null | undefined): string {
  if (setting === "off") return "Reasoning effort tidak dikirim (Jangan kirim); batas token dikirim sebagai max_tokens.";
  if (isEffortValue(setting)) return `Manual: dikirim reasoning effort "${setting}", temperature diabaikan.`;
  if (model.trim() === "") return "Otomatis: isi model untuk melihat setelan yang dipakai.";
  const effective = autoReasoningEffort(model);
  if (effective === null) return "Otomatis: model biasa — reasoning effort tidak dikirim.";
  return `Otomatis: model reasoning terdeteksi — dikirim reasoning effort "${effective}", temperature diabaikan.`;
}
