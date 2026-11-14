import { JENNA_SLOT_PROTOCOL, type JennaChatProtocol } from '@/lib/jenna/types';

export const PROTOCOL_LABEL: Record<JennaChatProtocol, string> = {
  openai: 'OpenAI-compatible',
  anthropic: 'Anthropic',
};

/** Slot tersimpan di telemetri (`chat_openai`, …) → label protokol; slot yang sudah tidak dikenal tampil apa adanya. */
export function slotLabel(slot: string): string {
  if (!Object.hasOwn(JENNA_SLOT_PROTOCOL, slot)) return slot;
  return PROTOCOL_LABEL[JENNA_SLOT_PROTOCOL[slot as keyof typeof JENNA_SLOT_PROTOCOL]];
}

/** "Anthropic · claude-…" untuk satu giliran; "—" bila telemetri belum ada (baris lama). */
export function providerLabel(slot: string | null, model: string | null): string {
  const parts = [slot ? slotLabel(slot) : null, model].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(' · ') : '—';
}
