import { withListQuery } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import type { ProgramTileItem } from "@/app/(public)/_com/program-tiles/ProgramTiles";
import { htmlToPlainText } from "@/lib/rich-text";
import { PROGRAM_INOVASI_BASE_HREF, PROGRAM_INOVASI_META_DESCRIPTION_MAX } from "./program-inovasi.meta";

/** Bentuk minimal item program inovasi dari `GET /api/landingpage/programinovasi/findMany`. */
export type ProgramInovasiApiItem = {
  id: string;
  name: string;
  /** HTML editor admin. */
  description?: string | null;
  image?: { link: string | null } | null;
};

/** URL detail `/inovasi/program-inovasi/{id}`. */
export function programInovasiDetailHref(id: string): string {
  return `${PROGRAM_INOVASI_BASE_HREF}/${encodeURIComponent(id)}`;
}

/** URL daftar; `search` kosong dan halaman 1 tidak ditulis ke query. */
export function programInovasiListHref(opts: { search?: string; page?: number } = {}): string {
  return withListQuery(PROGRAM_INOVASI_BASE_HREF, opts);
}

/** Item API → ubin: judul, cuplikan teks polos deskripsi (dipotong 3 baris oleh CSS), logo, tautan detail. */
export function toProgramInovasiTile(item: ProgramInovasiApiItem): ProgramTileItem {
  return {
    id: item.id,
    title: item.name.trim(),
    summary: htmlToPlainText(item.description),
    logo: item.image?.link?.trim() || undefined,
    href: programInovasiDetailHref(item.id),
  };
}

/** Deskripsi meta halaman detail: teks polos deskripsi, dipotong di batas kata dengan elipsis. */
export function programInovasiMetaDescription(
  html: string | null | undefined,
  max = PROGRAM_INOVASI_META_DESCRIPTION_MAX,
): string | undefined {
  const text = htmlToPlainText(html);
  if (!text) return undefined;
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
