import type { KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { loadKegiatanPage } from "@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-list.source";
import { toGotongRoyongItems } from "./gotong-royong.logic";
import { GOTONG_ROYONG_KATEGORI, GOTONG_ROYONG_KATEGORI_LIMIT } from "./gotong-royong.meta";

/**
 * Semua kegiatan Gotong Royong: satu panggilan find-many kegiatan desa per kategori (API `kategori` hanya satu nama),
 * digabung lewat `toGotongRoyongItems`. Galat salah satu kategori → seluruh daftar gagal (Error berkonteks).
 */
export async function loadGotongRoyongList(): Promise<KabarItem[]> {
  const pages = await Promise.all(
    GOTONG_ROYONG_KATEGORI.map((kategori) =>
      loadKegiatanPage({ page: 1, limit: GOTONG_ROYONG_KATEGORI_LIMIT, search: "", kategori }).catch((error: unknown) => {
        throw new Error(`Gotong royong kategori ${kategori} gagal dimuat: ${error instanceof Error ? error.message : String(error)}`);
      }),
    ),
  );
  return toGotongRoyongItems(pages.flatMap((page) => page.items));
}
