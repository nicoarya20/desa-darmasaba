import { proxy } from "valtio";
import {
  fetchJennaStatus,
  GENERIC_ERROR_MESSAGE,
  JennaChatError,
  type JennaPageContext,
  type JennaSource,
  streamJennaChat,
} from "./jenna.api";

export type JennaWidgetStatus = "loading" | "enabled" | "disabled";
export type JennaMessageStatus = "streaming" | "done" | "error";

export interface JennaMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: JennaSource[];
  status: JennaMessageStatus;
  /** Pertanyaan diucapkan lewat mode suara. */
  modality?: "voice";
  errorCode?: string;
  /** Epoch ms kapan boleh mencoba lagi (dari `retryAfterSec`). */
  retryAt?: number;
}

export interface JennaError {
  code: string;
  message: string;
  retryAfterSec?: number;
}

export interface JennaSendContext {
  pageContext?: JennaPageContext;
  /** Nilai input honeypot `website`. */
  website?: string;
}

/** Giliran dari mode suara: terikat sesi suara yang hidup dan bisa dibatalkan (barge-in). */
export interface JennaVoiceTurn {
  voiceSessionId: string;
  signal: AbortSignal;
  onStatus?: () => void;
  onDelta?: (text: string) => void;
}

type TurnOutcome = { kind: "done"; text: string } | { kind: "aborted" } | { kind: "failed"; error: JennaChatError };

/** Kode yang menampilkan tombol "Kirim ulang" (`network` = koneksi putus di sisi klien). */
export const RETRYABLE_CODES: ReadonlySet<string> = new Set(["busy", "provider_error", "timeout", "network"]);
export const ABORTED_CODE = "aborted";
export const STORAGE_KEY = "jenna:public-chat:v1";
export const MAX_STORED_MESSAGES = 30;

let controller: AbortController | null = null;
let seq = 0;
const nextId = () => `j${Date.now().toString(36)}${++seq}`;

function persist() {
  const messages = jennaState.messages.filter((m) => m.status !== "streaming").slice(-MAX_STORED_MESSAGES);
  try {
    if (messages.length === 0) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ conversationId: jennaState.conversationId, messages }));
  } catch {
    // sessionStorage bisa diblokir (mode privat/kuota penuh): percakapan tetap jalan, hanya tidak bertahan reload.
  }
}

const isStoredMessage = (value: unknown): value is JennaMessage => {
  const m = value as Partial<JennaMessage> | null;
  return (
    !!m &&
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.text === "string" &&
    (m.status === "done" || m.status === "error")
  );
};

function restore() {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return; // sessionStorage tidak tersedia: mulai dari percakapan kosong.
  }
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { conversationId?: unknown; messages?: unknown };
    const messages = Array.isArray(parsed.messages) ? parsed.messages.filter(isStoredMessage) : [];
    jennaState.messages = messages.slice(-MAX_STORED_MESSAGES);
    jennaState.conversationId = typeof parsed.conversationId === "string" ? parsed.conversationId : null;
  } catch {
    // Isi rusak/kedaluwarsa format: abaikan dan mulai baru.
  }
}

async function loadStatus() {
  try {
    const status = await fetchJennaStatus();
    jennaState.assistantName = status.assistantName;
    jennaState.maxInputChars = status.maxInputChars;
    jennaState.voiceEnabled = status.voiceEnabled;
    jennaState.status = status.enabled ? "enabled" : "disabled";
    if (status.enabled) restore();
  } catch (e) {
    // Status gagal dibaca = widget disembunyikan (pengunjung tidak pernah melihat "belum siap").
    console.error("[jenna] gagal memuat status", e);
    jennaState.status = "disabled";
  }
}

/** null = tidak dikirim (kosong, nonaktif, atau giliran teks lain masih berjalan). */
async function runTurn(text: string, ctx: JennaSendContext, voice?: JennaVoiceTurn): Promise<TurnOutcome | null> {
  const message = text.trim();
  if (!message || jennaState.status !== "enabled") return null;
  if (voice?.signal.aborted) return { kind: "aborted" };
  if (jennaState.sending) {
    if (!voice) return null;
    controller?.abort(); // Ucapan baru menggantikan giliran yang masih berjalan.
  }

  const ac = new AbortController();
  controller = ac;
  voice?.signal.addEventListener("abort", () => ac.abort(), { once: true });
  const assistantId = nextId();
  jennaState.messages.push(
    { id: nextId(), role: "user", text: message, status: "done", ...(voice ? { modality: "voice" as const } : {}) },
    { id: assistantId, role: "assistant", text: "", status: "streaming" },
  );
  jennaState.sending = true;
  jennaState.error = null;
  jennaState.statusText = null;

  // Dipatch lewat id: giliran yang sudah dibatalkan/di-reset tidak menimpa percakapan baru.
  const patch = (fn: (m: JennaMessage) => void) => {
    const m = jennaState.messages.find((x) => x.id === assistantId);
    if (m) fn(m);
  };
  const current = () => controller === ac;

  try {
    const out = await streamJennaChat(
      {
        message,
        conversationId: jennaState.conversationId ?? undefined,
        pageContext: ctx.pageContext,
        ...(voice ? { modality: "voice" as const, voiceSessionId: voice.voiceSessionId } : {}),
        website: ctx.website ?? "",
      },
      {
        onMeta: (id) => {
          if (current()) jennaState.conversationId = id;
        },
        onStatus: (t) => {
          if (current()) jennaState.statusText = t;
          voice?.onStatus?.();
        },
        onDelta: (t) => {
          patch((m) => (m.text += t));
          voice?.onDelta?.(t);
        },
      },
      ac.signal,
    );
    patch((m) => {
      m.text = out.text;
      m.sources = out.sources;
      m.status = "done";
    });
    if (current() && out.conversationId) jennaState.conversationId = out.conversationId;
    return { kind: "done", text: out.text };
  } catch (e) {
    if (ac.signal.aborted) {
      patch((m) => {
        m.status = "error";
        m.errorCode = ABORTED_CODE;
      });
      return { kind: "aborted" };
    } else {
      if (!(e instanceof JennaChatError)) console.error("[jenna] giliran chat gagal", e);
      const err = e instanceof JennaChatError ? e : new JennaChatError("network", GENERIC_ERROR_MESSAGE);
      patch((m) => {
        m.text = err.message;
        m.status = "error";
        m.errorCode = err.code;
        if (err.retryAfterSec) m.retryAt = Date.now() + err.retryAfterSec * 1000;
      });
      if (current()) jennaState.error = { code: err.code, message: err.message, retryAfterSec: err.retryAfterSec };
      return { kind: "failed", error: err };
    }
  } finally {
    if (current()) {
      controller = null;
      jennaState.sending = false;
      jennaState.statusText = null;
      persist();
    }
  }
}

async function send(text: string, ctx: JennaSendContext = {}) {
  await runTurn(text, ctx);
}

/**
 * Pertanyaan dari mode suara lewat jalur chat yang sama (`modality: "voice"`), tampil di percakapan.
 * Resolve teks jawaban final; reject `AbortError` saat dibatalkan atau `JennaChatError` saat gagal.
 */
async function askVoice(text: string, ctx: JennaSendContext, turn: JennaVoiceTurn): Promise<string> {
  const out = await runTurn(text, ctx, turn);
  if (!out) throw new JennaChatError("disabled", GENERIC_ERROR_MESSAGE);
  if (out.kind === "aborted") throw new DOMException("Giliran suara dibatalkan", "AbortError");
  if (out.kind === "failed") throw out.error;
  return out.text;
}

function abort() {
  controller?.abort();
}

/** Buang pasangan pertanyaan + jawaban gagal terakhir lalu kirim ulang pertanyaannya. */
async function retry(ctx: JennaSendContext = {}) {
  const { messages } = jennaState;
  const failed = messages[messages.length - 1];
  const question = messages[messages.length - 2];
  if (jennaState.sending || !failed || !question) return;
  if (failed.role !== "assistant" || failed.status !== "error" || !RETRYABLE_CODES.has(failed.errorCode ?? "")) return;
  if (question.role !== "user" || (failed.retryAt && failed.retryAt > Date.now())) return;
  jennaState.messages.splice(messages.length - 2, 2);
  await send(question.text, ctx);
}

/** "Mulai percakapan baru". */
function reset() {
  controller?.abort();
  controller = null;
  jennaState.messages = [];
  jennaState.conversationId = null;
  jennaState.sending = false;
  jennaState.statusText = null;
  jennaState.error = null;
  persist();
}

const jennaState = proxy({
  open: false,
  status: "loading" as JennaWidgetStatus,
  assistantName: "",
  maxInputChars: 0,
  /** Dari /api/jenna/status; tombol mikrofon juga butuh dukungan browser. */
  voiceEnabled: false,
  messages: [] as JennaMessage[],
  conversationId: null as string | null,
  sending: false,
  /** Teks event `status` dari server selama menunggu jawaban. */
  statusText: null as string | null,
  error: null as JennaError | null,
  loadStatus,
  send,
  askVoice,
  abort,
  retry,
  reset,
});

export default jennaState;
