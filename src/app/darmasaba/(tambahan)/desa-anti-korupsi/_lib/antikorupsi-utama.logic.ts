// Logika murni halaman utama Desa Anti Korupsi: semua indikator dikelompokkan per kategori,
// angka ringkasan (kategori · indikator · dokumen), dan tautan kategori → halaman detail.
import {
  groupByKategori,
  type AntiKorupsiApiItem,
  type AntiKorupsiGroup,
  type AntiKorupsiIndicator,
} from '@/app/darmasaba/_com/main-page/desaantikorupsi/desaantikorupsi.logic';
import { detailHref } from './kategori-tab';
import { programHref } from './program-folder';

/** Angka ringkasan di bawah lead halaman utama. */
export type AntiKorupsiUtamaRingkasan = { kategori: number; indikator: number; dokumen: number };

/** Hasil olah data findMany untuk halaman utama. */
export type AntiKorupsiUtamaView = {
  groups: AntiKorupsiGroup[];
  ringkasan: AntiKorupsiUtamaRingkasan;
  /** kategoriId → URL detail; memakai nama kategori asli (bukan sentence case) seperti data admin. */
  kategoriLinks: Record<string, string>;
};

/** Kelompokkan SEMUA indikator (tanpa batas beranda) + hitung ringkasan; dokumen tanpa angka dihitung 0. */
export function buildAntiKorupsiUtamaView(items: readonly AntiKorupsiApiItem[]): AntiKorupsiUtamaView {
  const groups = groupByKategori(items);
  const kategoriLinks: Record<string, string> = {};
  let dokumen = 0;
  for (const item of items) {
    kategoriLinks[item.kategoriId] ??= detailHref(item.kategori.name);
    dokumen += item.jumlahDokumen ?? 0;
  }
  return { groups, ringkasan: { kategori: groups.length, indikator: items.length, dokumen }, kategoriLinks };
}

/** Tautan butir indikator ke halaman programnya. */
export function utamaItemHref(item: AntiKorupsiIndicator): string {
  return programHref(item.id);
}
