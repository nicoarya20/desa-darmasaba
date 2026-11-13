// Penyimpanan giliran chat: teks user SUDAH dimask, teks asisten SUDAH lewat output guard (pemanggil).
// Giliran gagal hanya menyimpan pesan user berstatus error (tetap dihitung kuota, tidak masuk history).
import type { TokenUsage } from "../provider/types";
import type { ChatRepo, Identity } from "./conversation.repo";

export interface TurnToSave {
  conversationId: string;
  who: Identity;
  userText: string;
  assistantText: string;
  toolsUsed: string[];
  usage: TokenUsage;
  now: Date;
}

export function saveTurn(repo: ChatRepo, turn: TurnToSave): Promise<void> {
  return repo.appendMessages(
    turn.conversationId,
    turn.who,
    [
      { role: "user", content: turn.userText, status: "ok" },
      {
        role: "assistant",
        content: turn.assistantText,
        status: "ok",
        inputTokens: turn.usage.inputTokens,
        outputTokens: turn.usage.outputTokens,
        toolsUsed: turn.toolsUsed,
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
  /** Token yang sudah terpakai sebelum gagal — tetap dihitung ke budget global. */
  usage: TokenUsage;
  toolsUsed: string[];
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
        errorCode: turn.errorCode,
        inputTokens: turn.usage.inputTokens,
        outputTokens: turn.usage.outputTokens,
        toolsUsed: turn.toolsUsed,
      },
    ],
    turn.now,
  );
}
