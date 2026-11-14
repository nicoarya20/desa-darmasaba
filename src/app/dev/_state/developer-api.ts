import type { ApiResult } from "@/lib/jenna/types";
import { getServerMessage } from "@/utils/api-message";

/** Galat dari API /api/developer/* — `message` sudah aman ditampilkan ke user. */
export class DeveloperApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "DeveloperApiError";
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  401: "Sesi berakhir. Silakan login ulang.",
  403: "Akses ditolak. Halaman ini khusus Developer.",
};

/** fetch JSON ke endpoint developer; kembalikan `data` atau lempar DeveloperApiError. */
export async function developerRequest<T>(
  path: string,
  init?: { method?: "GET" | "PUT" | "POST" | "DELETE"; body?: unknown },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init?.method ?? "GET",
      credentials: "include",
      cache: "no-store",
      headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new DeveloperApiError("Tidak dapat terhubung ke server. Periksa koneksi Anda.", 0);
  }

  const json = (await res.json().catch(() => null)) as ApiResult<T> | null;
  if (res.ok && json?.success) return json.data;

  const message =
    getServerMessage(json) ?? STATUS_MESSAGES[res.status] ?? `Permintaan gagal (HTTP ${res.status}).`;
  throw new DeveloperApiError(message, res.status);
}

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof DeveloperApiError ? err.message : fallback;
}
