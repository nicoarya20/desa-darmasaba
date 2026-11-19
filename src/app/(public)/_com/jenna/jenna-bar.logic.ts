/** Konstanta & fungsi murni chat bar Jenna (pil kanan bawah). Tanpa React agar mudah diuji. */

/** Pertanyaan contoh: placeholder bergilir saat bar diam dan pil quick chat saat bar memanjang. */
export const JENNA_QUICK_CHATS = [
  "Jam pelayanan kantor desa?",
  "Apa syarat membuat surat keterangan?",
  "Agenda desa bulan ini?",
] as const;

export const JENNA_DISCLAIMER =
  "Jenna menjawab dari informasi resmi website Desa Darmasaba. Jangan kirim NIK, nomor KK, atau data pribadi.";

/** Placeholder asli textarea (dibacakan pembaca layar; teks bergilir hanya hiasan aria-hidden). */
export const JENNA_INPUT_PLACEHOLDER = "Tanya Jenna…";
/** Jeda ganti placeholder bergilir. */
export const PLACEHOLDER_ROTATE_MS = 3500;
/** Penghitung karakter baru muncul saat draf mencapai porsi batas ini. */
export const COUNTER_THRESHOLD = 0.9;

export type JennaBarMode = "idle" | "expanded" | "room";

/** Indeks placeholder berikutnya, berputar ke awal; daftar kosong selalu 0. */
export function nextPlaceholderIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

/** Penghitung karakter hanya tampil saat draf ≥ 90% batas (batas belum termuat = tidak tampil). */
export function showCounter(length: number, max: number): boolean {
  return max > 0 && length >= Math.ceil(max * COUNTER_THRESHOLD);
}

/** Room terbuka mengalahkan expanded; selain itu fokus/klik/sesi suara membuat bar memanjang. */
export function barMode(roomOpen: boolean, expanded: boolean): JennaBarMode {
  if (roomOpen) return "room";
  return expanded ? "expanded" : "idle";
}

interface CollapseInput {
  roomOpen: boolean;
  draft: string;
  /** Sesi suara berjalan atau dialog persetujuan mikrofon terbuka. */
  voiceBusy: boolean;
}

/** Klik di luar / fokus keluar mengembalikan bar ke idle hanya bila tak ada yang hilang: tanpa room, draf kosong, suara mati. */
export function canCollapseToIdle({ roomOpen, draft, voiceBusy }: CollapseInput): boolean {
  return !roomOpen && !voiceBusy && draft.trim() === "";
}
