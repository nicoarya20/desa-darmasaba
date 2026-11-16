import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { htmlToPlainText, sanitizeRichText } from "@/lib/rich-text";
import { INFO_TTG_BASE_HREF } from "./info-ttg.meta";

/** Bentuk minimal entri `/api/inovasi/infotekno/find-many`. */
export type InfoTtgApiItem = {
  id: string;
  name: string;
  /** HTML editor admin (umumnya paragraf). */
  deskripsi?: string | null;
  image?: { link?: string | null } | null;
};

/** Satu entri siap tampil; `html`/`imageUrl` tidak ada bila kosong di data (tidak diganti placeholder). */
export type Ttg = {
  id: string;
  title: string;
  /** Sudah dibersihkan (`sanitizeRichText`). */
  html?: string;
  imageUrl?: string;
};

/**
 * Petakan entri API; isi HTML dibersihkan lewat `sanitize` (bawaan DOMPurify, diganti di test). Isi tanpa teks
 * (editor menyimpan `<p></p>` / `&nbsp;` untuk isian kosong) dianggap tidak ada, apa pun `sanitize`-nya, agar ubin
 * jatuh ke tata letak tanpa isi alih-alih kolom kanan kosong.
 */
export function toTtg(item: InfoTtgApiItem, sanitize: (html: string) => string = sanitizeRichText): Ttg {
  const raw = item.deskripsi ?? "";
  const html = htmlToPlainText(raw) ? sanitize(raw) : "";
  const imageUrl = item.image?.link?.trim() ?? "";
  return {
    id: item.id,
    title: item.name.trim(),
    html: html || undefined,
    imageUrl: imageUrl || undefined,
  };
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function infoTtgListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(INFO_TTG_BASE_HREF, opts);
}
