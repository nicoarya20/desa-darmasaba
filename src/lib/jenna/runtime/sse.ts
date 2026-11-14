// Respons SSE untuk POST /api/jenna/chat (Web Response, dipakai Next Route Handler).

export const SSE_PING_MS = 15_000;

export const SSE_HEADERS = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-cache, no-transform",
  connection: "keep-alive",
  "x-accel-buffering": "no",
} as const;

export const SSE_GENERIC_ERROR = { code: "provider_error", message: "Terjadi kesalahan, silakan coba lagi." } as const;

export function formatSseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export type SseSend = (event: string, data: unknown) => void;

/**
 * Bungkus `run` menjadi respons SSE. `: open` dikirim dulu agar proxy segera membuka aliran, lalu
 * `: ping` berkala. Klien menutup koneksi / `parent` abort → signal `run` ikut abort dan `send`
 * diabaikan. `run` melempar → satu event `error` generik; detail hanya ke log server.
 */
export function createSseResponse(
  run: (send: SseSend, signal: AbortSignal) => Promise<void>,
  parent?: AbortSignal,
  pingMs = SSE_PING_MS,
): Response {
  const enc = new TextEncoder();
  const abort = new AbortController();
  let closed = false;
  let ping: ReturnType<typeof setInterval> | undefined;

  const onParentAbort = () => abort.abort();
  if (parent?.aborted) abort.abort();
  else parent?.addEventListener("abort", onParentAbort, { once: true });

  const cleanup = () => {
    closed = true;
    if (ping) clearInterval(ping);
    parent?.removeEventListener("abort", onParentAbort);
  };

  const body = new ReadableStream<Uint8Array>({
    start(ctrl) {
      const write = (text: string) => {
        if (closed || abort.signal.aborted) return;
        try {
          ctrl.enqueue(enc.encode(text));
        } catch {
          // Stream sudah ditutup dari sisi klien; tulisan berikutnya dibuang.
          closed = true;
        }
      };
      write(": open\n\n");
      ping = setInterval(() => write(": ping\n\n"), pingMs);
      const send: SseSend = (event, data) => write(formatSseEvent(event, data));
      run(send, abort.signal)
        .catch((err: unknown) => {
          console.error("[jenna] stream gagal:", err);
          send("error", SSE_GENERIC_ERROR);
        })
        .finally(() => {
          cleanup();
          try {
            ctrl.close();
          } catch {
            // Sudah ditutup/di-cancel oleh klien.
          }
        });
    },
    cancel() {
      abort.abort();
      cleanup();
    },
  });
  return new Response(body, { headers: SSE_HEADERS });
}
