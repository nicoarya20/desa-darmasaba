// Origin publik (proto://host) dari sebuah Request, untuk membangun URL redirect.
// PENTING: di belakang proxy (Cloudflare → Portainer), req.url ter-resolve ke host
// internal container (mis. localhost:3000), bukan domain publik. Jadi prioritaskan
// header X-Forwarded-* yang di-set proxy. Fungsi murni — mudah di-test.

export function getRequestOrigin(req: Request): string {
  const h = req.headers;
  // header bisa berisi list "a, b" (rantai proxy) — ambil entri pertama.
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    h.get("host")?.split(",")[0]?.trim() ||
    "";
  return `${proto}://${host}`;
}
