/** Helper murni section beranda Desa Anti Korupsi: rapikan teks kapital, ambil nomor indikator, kelompokkan per kategori. */

/**
 * Istilah yang ejaannya dipertahankan saat teks kapital diubah ke huruf biasa
 * (kunci huruf kecil → ejaan tampil). Tambah di sini bila data memuat singkatan baru.
 */
export const KEEP_CASE_TERMS: Readonly<Record<string, string>> = {
  apbdes: "APBDes",
  perdes: "Perdes",
  rkp: "RKP",
  skm: "SKM",
  sop: "SOP",
  trantibumlinmas: "Trantibumlinmas",
};

const WORD = /[\p{L}\p{N}]+/gu;
const LOWERCASE_LETTER = /\p{Ll}/u;
/** Huruf/angka pertama: kalimat yang diawali angka ("3 tahun ...") tidak dikapitalkan. */
const FIRST_ALNUM = /[\p{L}\p{N}]/u;

/**
 * Ubah teks yang tersimpan HURUF KAPITAL semua menjadi sentence case untuk tampilan.
 * Teks yang sudah memuat huruf kecil dianggap sudah ditulis rapi oleh admin dan hanya dirapikan spasinya.
 */
export function toSentenceCase(text: string, terms: Readonly<Record<string, string>> = KEEP_CASE_TERMS): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (LOWERCASE_LETTER.test(clean)) return clean;

  const lowered = clean.toLowerCase();
  const first = lowered.search(FIRST_ALNUM);
  const capitalized =
    first < 0 ? lowered : lowered.slice(0, first) + lowered.charAt(first).toUpperCase() + lowered.slice(first + 1);

  return capitalized.replace(WORD, (word) => terms[word.toLowerCase()] ?? word);
}

export type IndicatorText = {
  /** Nomor indikator di awal teks (mis. "1.1"), atau null bila teks tidak diawali nomor. */
  number: string | null;
  text: string;
};

const LEADING_NUMBER = /^\s*(\d+(?:\.\d+)*)[.)]?\s+(\S[\s\S]*)$/;

/** Pisahkan nomor indikator ("1.1 ADANYA ...") dari teksnya. */
export function splitIndicatorNumber(name: string): IndicatorText {
  const match = LEADING_NUMBER.exec(name);
  if (!match) return { number: null, text: name.trim() };
  return { number: match[1], text: match[2].trim() };
}

/** Bentuk minimal item `desaAntikorupsi.findMany` yang dibaca section ini. */
export type AntiKorupsiApiItem = {
  id: string;
  name: string;
  kategoriId: string;
  kategori: { name: string };
};

export type AntiKorupsiIndicator = IndicatorText & { id: string };

export type AntiKorupsiGroup = {
  id: string;
  name: string;
  items: AntiKorupsiIndicator[];
};

/**
 * Kelompokkan indikator per kategori (urutan grup = urutan kemunculan pertama di data),
 * nama kategori & teks butir sudah dalam sentence case.
 */
export function groupByKategori(items: readonly AntiKorupsiApiItem[]): AntiKorupsiGroup[] {
  const groups = new Map<string, AntiKorupsiGroup>();

  for (const item of items) {
    let group = groups.get(item.kategoriId);
    if (!group) {
      group = { id: item.kategoriId, name: toSentenceCase(item.kategori.name), items: [] };
      groups.set(item.kategoriId, group);
    }
    const { number, text } = splitIndicatorNumber(item.name);
    group.items.push({ id: item.id, number, text: toSentenceCase(text) });
  }

  return [...groups.values()];
}
