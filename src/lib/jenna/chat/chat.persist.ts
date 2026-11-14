// Penyimpanan giliran chat: teks user SUDAH dimask, teks asisten SUDAH lewat output guard (pemanggil).
// Giliran gagal hanya menyimpan pesan user berstatus error (tetap dihitung kuota, tidak masuk history).
import type { JennaModality } from "../chat-types";
import type { TokenUsage } from "../provider/types";
import type { ChatRepo, Identity } from "./conversation.repo";

/** Telemetri satu giliran untuk developer console (tab Penggunaan & Log Error). */
export interface TurnTelemetry {
  /** Dari awal `executeTurn` sampai giliran disimpan. */
  latencyMs: number;
  providerSlot: string;
  model: string;
}

export interface TurnToSave {
  conversationId: string;
  who: Identity;
  userText: string;
  assistantText: string;
  toolsUsed: string[];
  usage: TokenUsage;
  telemetry: TurnTelemetry;
  modality: JennaModality;
  now: Date;
}

export function saveTurn(repo: ChatRepo, turn: TurnToSave): Promise<void> {
  return repo.appendMessages(
    turn.conversationId,
    turn.who,
    [
      { role: "user", content: turn.userText, status: "ok", modality: turn.modality },
      {
        role: "assistant",
        content: turn.assistantText,
        status: "ok",
        modality: turn.modality,
        inputTokens: turn.usage.inputTokens,
        outputTokens: turn.usage.outputTokens,
        toolsUsed: turn.toolsUsed,
        ...turn.telemetry,
      },
    ],
    turn.now,
  );
}

export interface FailedTurn {
  conversationId: string;
  who: Identity;
  userText: string;
  /** Kode internal ringkas (tanpa detail provider). */
  errorCode: string;
  /** Penyebab asli yang sudah disanitasi; null untuk `client_closed`. Hanya untuk developer console. */
  errorDetail: string | null;
  /** Token yang sudah terpakai sebelum gagal — tetap dihitung ke budget global. */
  usage: TokenUsage;
  toolsUsed: string[];
  telemetry: TurnTelemetry;
  modality: JennaModality;
  now: Date;
}

export function recordFailedTurn(repo: ChatRepo, turn: FailedTurn): Promise<void> {
  return repo.appendMessages(
    turn.conversationId,
    turn.who,
    [
      {
        role: "user",
        content: turn.userText,
        status: "error",
        modality: turn.modality,
        errorCode: turn.errorCode,
        errorDetail: turn.errorDetail,
        inputTokens: turn.usage.inputTokens,
        outputTokens: turn.usage.outputTokens,
        toolsUsed: turn.toolsUsed,
        ...turn.telemetry,
      },
    ],
    turn.now,
  );
}
