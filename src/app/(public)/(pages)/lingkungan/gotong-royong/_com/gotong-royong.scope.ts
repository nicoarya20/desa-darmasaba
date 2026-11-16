import type { KabarPage, KabarPageQuery } from "@/app/(public)/_com/kabar-list/use-kabar-page";
import { loadKegiatanPage } from "@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-list.source";
import type { KegiatanScope } from "@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-scope";
import { KATEGORI_GOTONG_ROYONG_ID } from "@/lib/kegiatan-gotong-royong";
import { gotongRoyongListHref } from "./gotong-royong.meta";
import { GOTONG_ROYONG_TEXT } from "./gotong-royong.text";

/** Satu halaman kegiatan desa berkategori Gotong Royong (disaring per id kategori tetap, bukan nama). */
export function loadGotongRoyongPage(query: KabarPageQuery): Promise<KabarPage> {
  return loadKegiatanPage({ ...query, kategori: "" }, KATEGORI_GOTONG_ROYONG_ID);
}

/** Cakupan daftar Kegiatan Desa untuk halaman Gotong Royong: satu kategori tetap, tanpa pil kategori. */
export const GOTONG_ROYONG_SCOPE: KegiatanScope = {
  load: loadGotongRoyongPage,
  listHref: gotongRoyongListHref,
  withKategori: false,
  text: GOTONG_ROYONG_TEXT,
};
