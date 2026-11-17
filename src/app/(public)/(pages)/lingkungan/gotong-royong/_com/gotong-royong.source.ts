import type { KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { loadKegiatanPage } from "@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-list.source";
import { KATEGORI_GOTONG_ROYONG_ID } from "@/lib/kegiatan-gotong-royong";
import { toGotongRoyongItems } from "./gotong-royong.logic";
import { GOTONG_ROYONG_LIMIT } from "./gotong-royong.meta";

/** Semua kegiatan Gotong Royong: satu panggilan find-many kegiatan desa yang disaring per id kategori tetap. */
export async function loadGotongRoyongList(): Promise<KabarItem[]> {
  const page = await loadKegiatanPage({ page: 1, limit: GOTONG_ROYONG_LIMIT, search: "", kategori: "" }, KATEGORI_GOTONG_ROYONG_ID).catch(
    (error: unknown) => {
      throw new Error(`Kegiatan Gotong Royong gagal dimuat: ${error instanceof Error ? error.message : String(error)}`);
    },
  );
  return toGotongRoyongItems(page.items);
}
