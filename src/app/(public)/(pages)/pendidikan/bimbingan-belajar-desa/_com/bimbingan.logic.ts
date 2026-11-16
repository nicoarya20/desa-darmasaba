import { toProgramInfoContent, type ProgramInfoEntry } from '../../_com/program-info/program-info.logic';

/** Kunci loader isian "Lokasi dan Jadwal" (lihat `bimbingan.source.ts`). */
export const LOKASI_KEY = 'lokasi';

/** Jenis ikon butir info praktis; `null` = label tak dikenali (tanpa ikon). */
export type InfoKind = 'lokasi' | 'jadwal' | 'peserta' | null;
export type LabeledItem = { label: string; value: string; kind: InfoKind };

/** Panel info praktis (isian Lokasi dan Jadwal yang berpola "Label: nilai"). */
export type InfoPraktisData = { judul: string; items: LabeledItem[] };

/**
 * Daftar CMS berpola "Label: nilai" → pasangan label/nilai (aturan istilah `splitTerm` modul bersama). Semua
 * butir harus berlabel; satu saja tidak → `null` (Lokasi tetap jadi bagian biasa agar tak ada teks yang hilang).
 */
export function toLabeledItems(html: string | null | undefined): LabeledItem[] | null {
  const content = toProgramInfoContent(html);
  if (content.kind !== 'list') return null;
  const labeled: LabeledItem[] = [];
  for (const { term, text } of content.items) {
    if (!term || !text) return null;
    labeled.push({ label: term, value: text, kind: iconForLabel(term) });
  }
  return labeled.length > 0 ? labeled : null;
}

/** Jenis ikon dari kata kunci label (teks label tetap dari CMS, tidak diganti). */
export function iconForLabel(label: string): InfoKind {
  const text = label.toLowerCase();
  if (/\b(lokasi|tempat|alamat)\b/.test(text)) return 'lokasi';
  if (/\b(jadwal|hari|waktu|jam)\b/.test(text)) return 'jadwal';
  if (/\b(peserta|sasaran)\b/.test(text)) return 'peserta';
  return null;
}

/**
 * Pisahkan isian Lokasi dan Jadwal menjadi panel info praktis bila berhasil dimuat dan berpola label; panel
 * dipakai → Lokasi tidak diulang sebagai bagian. Gagal/kosong/bukan daftar berlabel → tetap bagian biasa
 * (pesan galat/kosong modul bersama tetap muncul).
 */
export function splitInfoPraktis(entries: readonly ProgramInfoEntry[]): {
  info: InfoPraktisData | null;
  sections: ProgramInfoEntry[];
} {
  const lokasi = entries.find((entry) => entry.key === LOKASI_KEY);
  const items = lokasi && !lokasi.failed ? toLabeledItems(lokasi.html) : null;
  if (!lokasi || !items) return { info: null, sections: [...entries] };
  return {
    info: { judul: lokasi.title, items },
    sections: entries.filter((entry) => entry.key !== LOKASI_KEY),
  };
}
