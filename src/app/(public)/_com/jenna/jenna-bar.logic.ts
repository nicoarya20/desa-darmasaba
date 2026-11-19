/** Konstanta & fungsi murni chat bar Jenna (pil kanan bawah). Tanpa React agar mudah diuji. */

/** Pertanyaan contoh: diketik bergantian di bar diam dan jadi pil quick chat saat bar memanjang. */
export const JENNA_QUICK_CHATS = [
  "Jam pelayanan kantor desa?",
  "Apa syarat membuat surat keterangan?",
  "Agenda desa bulan ini?",
] as const;

export const JENNA_DISCLAIMER =
  "Jenna menjawab dari informasi resmi website Desa Darmasaba. Jangan kirim NIK, nomor KK, atau data pribadi.";

/** Placeholder asli textarea (dibacakan pembaca layar; teks ketikan hanya hiasan aria-hidden). */
export const JENNA_INPUT_PLACEHOLDER = "Tanya Jenna…";
/** Penghitung karakter baru muncul saat draf mencapai porsi batas ini. */
export const COUNTER_THRESHOLD = 0.9;

export type JennaBarMode = "idle" | "expanded" | "room";

/** Tempo animasi ketik placeholder (ms): per huruf diketik, lalu jeda saat teks lengkap. */
export const TYPING_TIMING = { typeMs: 52, holdMs: 3000 } as const;

export type TypingTiming = { typeMs: number; holdMs: number };
export type TypingPhase = "typing" | "hold";

export interface TypingFrame {
  /** Indeks teks yang sedang dianimasikan. */
  index: number;
  /** Potongan teks yang tampil pada saat ini. */
  text: string;
  phase: TypingPhase;
  /** Sisa waktu (ms, ≥ 1) sampai tampilan berubah: dipakai sebagai jeda timer tunggal berikutnya. */
  nextIn: number;
}

const segmentMs = (len: number, t: TypingTiming) => len * t.typeMs + t.holdMs;

/** Bingkai animasi ketik pada waktu `elapsed` (ms sejak mulai): mulai kosong, huruf bertambah tiap `typeMs`,
    jeda `holdMs` saat lengkap, lalu teks langsung hilang (tanpa hapus mundur) dan teks berikutnya diketik; berulang.
    Deterministik agar timer bisa dilanjutkan dari waktu mana pun. */
export function typingFrame(texts: readonly string[], elapsed: number, timing: TypingTiming = TYPING_TIMING): TypingFrame {
  const total = texts.reduce((sum, s) => sum + segmentMs(s.length, timing), 0);
  if (texts.length === 0 || total <= 0) return { index: 0, text: "", phase: "hold", nextIn: Number.POSITIVE_INFINITY };
  let local = ((elapsed % total) + total) % total;
  let index = 0;
  while (local >= segmentMs(texts[index].length, timing)) {
    local -= segmentMs(texts[index].length, timing);
    index += 1;
  }
  const full = texts[index];
  const typeEnd = full.length * timing.typeMs;
  if (local < typeEnd) {
    const shown = Math.floor(local / timing.typeMs);
    return { index, text: full.slice(0, shown), phase: "typing", nextIn: Math.max(1, (shown + 1) * timing.typeMs - local) };
  }
  return { index, text: full, phase: "hold", nextIn: Math.max(1, typeEnd + timing.holdMs - local) };
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

export interface CloseState {
  open: boolean;
  barExpanded: boolean;
}

/** Tombol perkecil / Escape = tutup penuh: room ditutup dan bar kembali idle; selama sesi suara bar tetap memanjang (kontrol suara ada di bar). */
export function closeToIdle(voiceOn: boolean): CloseState {
  return { open: false, barExpanded: voiceOn };
}

/** "Mulai percakapan baru" (jumlah pesan turun dari > 0 ke 0): room ditutup, bar tetap memanjang dengan quick chat. */
export function isConversationReset(prevCount: number, count: number): boolean {
  return prevCount > 0 && count === 0;
}
