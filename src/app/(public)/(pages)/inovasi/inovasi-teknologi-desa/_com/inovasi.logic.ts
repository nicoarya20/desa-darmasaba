import type { KabarListTab } from "@/app/(public)/_com/kabar-list/KabarListHeader";
import { parsePage } from "@/app/(public)/_com/kabar-list/kabar-list.logic";
import { htmlToText, type KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import {
  INOVASI_KATEGORI,
  INOVASI_KATEGORI_LABEL,
  inovasiKategoriLabel,
  isInovasiKategori,
  type InovasiKategori,
} from "@/lib/inovasi-teknologi/kategori";
import { INOVASI_TEKNOLOGI_HREF } from "./inovasi.meta";
import { INOVASI_TEXT } from "./inovasi.text";

/** Bentuk minimal item `/api/inovasi/inovasiteknologi/find-many` dan `/:id`. */
export type InovasiApiItem = {
  id: string;
  name: string;
  /** HTML editor admin. */
  deskripsi?: string | null;
  kategori?: string | null;
  createdAt: string | Date;
  image?: { link?: string | null } | null;
};

/** Keadaan daftar dari URL: kategori ('' = semua), kata kunci, halaman. */
export type InovasiParams = { kategori: InovasiKategori | ""; search: string; page: number };

/** Baca `?kategori=&search=&page=`; kategori tak dikenal → semua. */
export function parseInovasiParams(params: Pick<URLSearchParams, "get">): InovasiParams {
  const kategori = params.get("kategori");
  return {
    kategori: isInovasiKategori(kategori) ? kategori : "",
    search: params.get("search")?.trim() ?? "",
    page: parsePage(params.get("page")),
  };
}

/** URL daftar; kategori kosong, kata kunci kosong, dan halaman 1 tidak ditulis ke query. */
export function inovasiListHref(opts: Partial<InovasiParams> = {}): string {
  const query = new URLSearchParams();
  if (opts.kategori) query.set("kategori", opts.kategori);
  const search = opts.search?.trim();
  if (search) query.set("search", search);
  if (opts.page && opts.page > 1) query.set("page", String(opts.page));
  const qs = query.toString();
  return qs ? `${INOVASI_TEKNOLOGI_HREF}?${qs}` : INOVASI_TEKNOLOGI_HREF;
}

/** URL detail `/inovasi/inovasi-teknologi-desa/{id}`. */
export function inovasiDetailHref(id: string): string {
  return `${INOVASI_TEKNOLOGI_HREF}/${encodeURIComponent(id)}`;
}

/** Pil kategori kepala daftar: Semua + satu per kategori; kata kunci aktif ikut dibawa. */
export function inovasiTabs(active: InovasiKategori | "", search: string): KabarListTab[] {
  return [
    { key: "semua", label: INOVASI_TEXT.semua, href: inovasiListHref({ search }), active: active === "" },
    ...INOVASI_KATEGORI.map((kategori) => ({
      key: kategori,
      label: INOVASI_KATEGORI_LABEL[kategori],
      href: inovasiListHref({ kategori, search }),
      active: active === kategori,
    })),
  ];
}

/** Item API → kartu gaya Berita; label kategori tampil sebagai pil kartu. */
export function toInovasiItem(item: InovasiApiItem): KabarItem {
  return {
    id: item.id,
    title: item.name.trim(),
    summary: htmlToText(item.deskripsi),
    kategori: inovasiKategoriLabel(item.kategori) || undefined,
    imageUrl: item.image?.link || undefined,
    createdAt: new Date(item.createdAt).getTime(),
    href: inovasiDetailHref(item.id),
  };
}
