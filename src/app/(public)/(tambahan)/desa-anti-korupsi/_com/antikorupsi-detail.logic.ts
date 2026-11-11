/** Helper murni halaman detail Desa Anti Korupsi: baris indikator + ringkasan isi folder dokumen tiap indikator. */
import {
  splitIndicatorNumber,
  toSentenceCase,
} from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.logic';
import { programHref, ringkasanIsi } from '../_lib/program-folder';

/**
 * Bentuk minimal item `desaAntikorupsi.findMany` yang dibaca halaman detail. Dokumen kini disimpan per folder,
 * jadi daftar hanya membawa jumlahnya; isi lengkap dibuka di halaman program.
 */
export type AntiKorupsiDetailApiItem = {
  id: string;
  name: string;
  kategori?: { name?: string | null } | null;
  jumlahFolder?: number | null;
  jumlahDokumen?: number | null;
};

/** Isi dokumen satu indikator yang bisa dibuka: tautan ke halaman program + ringkasan "N folder · M dokumen". */
export type AntiKorupsiIsi = {
  href: string;
  ringkasan: string;
};

export type AntiKorupsiDokumenRow = {
  id: string;
  number: string | null;
  text: string;
  /** null = belum ada dokumen; baris tampil sebagai tempat kosong "Dokumen belum tersedia". */
  isi: AntiKorupsiIsi | null;
};

/** Isi dokumen satu indikator, atau null bila belum ada dokumen sama sekali. */
export function toIsi(item: AntiKorupsiDetailApiItem): AntiKorupsiIsi | null {
  const jumlahDokumen = item.jumlahDokumen ?? 0;
  if (jumlahDokumen <= 0) return null;
  return { href: programHref(item.id), ringkasan: ringkasanIsi(item.jumlahFolder ?? 0, jumlahDokumen) };
}

/** Ubah item API jadi baris tampilan: nomor dipisah, teks sentence case, ringkasan isi folder. */
export function toDokumenRows(items: readonly AntiKorupsiDetailApiItem[]): AntiKorupsiDokumenRow[] {
  return items.map((item) => {
    const { number, text } = splitIndicatorNumber(item.name);
    return { id: item.id, number, text: toSentenceCase(text), isi: toIsi(item) };
  });
}

/** Daftar nama kategori (nama asli dari DB) sesuai urutan kemunculan pertama di data. */
export function kategoriNames(items: readonly AntiKorupsiDetailApiItem[]): string[] {
  const names = items.map((item) => item.kategori?.name).filter((name): name is string => Boolean(name));
  return [...new Set(names)];
}

/** Jumlah indikator per nama kategori (untuk angka di pil kategori). */
export function countByKategori(items: readonly AntiKorupsiDetailApiItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const name = item.kategori?.name;
    if (name) counts[name] = (counts[name] ?? 0) + 1;
  }
  return counts;
}

/** Jumlah indikator yang sudah punya dokumen. */
export function countDokumen(rows: readonly AntiKorupsiDokumenRow[]): number {
  return rows.filter((row) => row.isi !== null).length;
}
