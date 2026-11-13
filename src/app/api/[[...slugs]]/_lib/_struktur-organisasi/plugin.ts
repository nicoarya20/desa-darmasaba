import Elysia from "elysia";

/**
 * Buat plugin Elysia struktur organisasi dengan penanganan error seragam kontrak:
 * body/query tidak valid → 400, error tak terduga → 500 (dicatat dengan `logTag` + method + path),
 * keduanya berbentuk `{ success: false, message }`.
 * `Prefix` generik agar literal path tetap terbawa ke tipe Eden (ApiFetch).
 */
export function strukturPlugin<const Prefix extends string>(prefix: Prefix, tag: string, logTag: string) {
  return new Elysia({ prefix, tags: [tag] }).onError(({ code, error, set, request }) => {
    if (code === "NOT_FOUND") return;
    if (code === "VALIDATION" || code === "PARSE") {
      set.status = 400;
      return { success: false as const, message: "Data yang dikirim tidak valid" };
    }
    const { pathname } = new URL(request.url);
    console.error(`[${logTag}] ${request.method} ${pathname} gagal:`, error);
    set.status = 500;
    return { success: false as const, message: "Terjadi kesalahan pada server" };
  });
}
