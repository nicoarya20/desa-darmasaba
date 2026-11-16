// Klien HTTP/SSE widget Jenna publik. Pesan error dari server sudah berbahasa Indonesia dan aman ditampilkan.
import type { JennaChatRequest, JennaDone, JennaSource, JennaStatus } from "@/lib/jenna/chat-types";
import { readSseStream } from "@/lib/jenna/runtime/sse-parser";

export type { JennaChatRequest, JennaDone, JennaPageContext, JennaSource, JennaStatus } from "@/lib/jenna/chat-types";

export interface JennaStreamHandlers {
  onMeta?: (conversationId: string) => void;
  onStatus?: (text: string) => void;
  onDelta?: (text: string) => void;
}

export const GENERIC_ERROR_MESSAGE = "Jenna sedang tidak bisa menjawab. Silakan coba lagi.";
export const DISCONNECTED_MESSAGE = "Koneksi terputus sebelum jawaban selesai. Silakan coba lagi.";

export class JennaChatError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly retryAfterSec?: number,
  ) {
    super(message);
    this.name = "JennaChatError";
  }
}

type Json = Record<string, unknown>;

const asObject = (value: unknown): Json => (value && typeof value === "object" ? (value as Json) : {});
const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const asSeconds = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.ceil(value) : undefined;

function toChatError(body: unknown, retryAfterHeader?: string | null): JennaChatError {
  const b = asObject(body);
  const header = retryAfterHeader ? Number(retryAfterHeader) : undefined;
  return new JennaChatError(
    asString(b.code) ?? "provider_error",
    asString(b.message) || GENERIC_ERROR_MESSAGE,
    asSeconds(b.retryAfterSec) ?? asSeconds(header),
  );
}

function toSources(value: unknown): JennaSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const s = asObject(item);
    const title = asString(s.title);
    const url = asString(s.url);
    return title && url ? [{ title, url }] : [];
  });
}

/** Status publik; bentuk respons yang tidak sesuai kontrak dianggap nonaktif. */
export async function fetchJennaStatus(signal?: AbortSignal): Promise<JennaStatus> {
  const res = await fetch("/api/jenna/status", { cache: "no-store", signal });
  if (!res.ok) throw new Error(`GET /api/jenna/status ${res.status}`);
  const b = asObject(await res.json());
  const assistantName = asString(b.assistantName)?.trim() ?? "";
  const maxInputChars = typeof b.maxInputChars === "number" ? Math.floor(b.maxInputChars) : 0;
  return {
    enabled: b.enabled === true && assistantName !== "" && maxInputChars > 0,
    assistantName,
    maxInputChars,
    voiceEnabled: b.voiceEnabled === true,
  };
}

/** Satu giliran chat lewat SSE. Melempar `JennaChatError`, atau `AbortError` bila `signal` dibatalkan. */
export async function streamJennaChat(
  body: JennaChatRequest,
  handlers: JennaStreamHandlers,
  signal: AbortSignal,
): Promise<JennaDone> {
  let res: Response;
  try {
    res = await fetch("/api/jenna/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (signal.aborted) throw e;
    throw new JennaChatError("network", "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
  }

  const isJson = (res.headers.get("content-type") ?? "").includes("application/json");
  if (!res.ok || isJson) {
    const parsed: unknown = await res.json().catch(() => null);
    throw toChatError(parsed, res.headers.get("retry-after"));
  }
  if (!res.body) throw new JennaChatError("network", DISCONNECTED_MESSAGE);

  // `as`: assignment di callback tidak dilacak control-flow TS.
  let done = null as JennaDone | null;
  let failure = null as JennaChatError | null;
  try {
    await readSseStream(res.body, (e) => {
      let data: Json;
      try {
        data = asObject(JSON.parse(e.data));
      } catch {
        return; // event rusak dilewati; tanpa `done` giliran berakhir sebagai koneksi terputus
      }
      if (e.event === "meta") {
        const id = asString(data.conversationId);
        if (id) handlers.onMeta?.(id);
      } else if (e.event === "status") {
        const text = asString(data.text);
        if (text) handlers.onStatus?.(text);
      } else if (e.event === "delta") {
        const text = asString(data.text);
        if (text) handlers.onDelta?.(text);
      } else if (e.event === "done") {
        done = {
          conversationId: asString(data.conversationId) ?? "",
          text: asString(data.text) ?? "",
          sources: toSources(data.sources),
        };
      } else if (e.event === "error") {
        failure = toChatError(data);
      }
    });
  } catch (e) {
    if (signal.aborted) throw e;
    throw new JennaChatError("network", DISCONNECTED_MESSAGE);
  }
  if (failure) throw failure;
  if (!done) throw new JennaChatError("network", DISCONNECTED_MESSAGE);
  return done;
}
