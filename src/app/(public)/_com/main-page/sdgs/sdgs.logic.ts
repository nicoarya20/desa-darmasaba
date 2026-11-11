/** Bentuk minimal item `/api/landingpage/sdgsdesa/findMany`. */
export type SdgsApiItem = {
  id: string;
  name: string;
  /** Skor sebagai string dari admin, mis. `"99.64"` atau `"52,62"`. */
  jumlah?: string | null;
  image?: { link?: string | null } | null;
};

/** Satu tujuan SDGs siap tampil di beranda. */
export type SdgsItem = {
  id: string;
  name: string;
  /** Skor apa adanya dari data (sudah di-trim). */
  skorLabel: string;
  skor: number;
  imageUrl?: string;
};

/** String skor → angka; titik atau koma desimal. Kosong/tidak valid → null. */
export function parseSkor(jumlah: string | null | undefined): number | null {
  const text = jumlah?.trim();
  if (!text) return null;
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

/** Ambil array item dari body respons (`{ data: [] }` atau array langsung); bentuk lain → []. */
export function readSdgsList(body: unknown): SdgsApiItem[] {
  if (Array.isArray(body)) return body as SdgsApiItem[];
  const data = (body as { data?: unknown } | null | undefined)?.data;
  return Array.isArray(data) ? (data as SdgsApiItem[]) : [];
}

/** `limit` tujuan dengan skor tertinggi; item tanpa skor valid dibuang, skor sama tetap urutan asal. */
export function pickTopSdgs(items: readonly SdgsApiItem[], limit: number): SdgsItem[] {
  const scored: SdgsItem[] = [];
  for (const item of items) {
    const skorLabel = item.jumlah?.trim() ?? "";
    const skor = parseSkor(skorLabel);
    if (skor === null) continue;
    scored.push({
      id: item.id,
      name: item.name.trim(),
      skorLabel,
      skor,
      imageUrl: item.image?.link || undefined,
    });
  }
  return scored.sort((a, b) => b.skor - a.skor).slice(0, limit);
}
