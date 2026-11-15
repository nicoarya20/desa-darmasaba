/** Helper murni halaman publik Info Sekolah: URL daftar pengajar, pil jenjang, pesan kosong, ringkasan per jenjang. */
import { compareJenjang } from "@/lib/jenjang-pendidikan-urutan";

export const INFO_SEKOLAH_PATH = "/pendidikan/info-sekolah";
export const PENGAJAR_PATH = `${INFO_SEKOLAH_PATH}/pengajar`;

/** `id` panel "Sekolah per jenjang"; tujuan `/lembaga` lama (`#lembaga`). */
export const LEMBAGA_ANCHOR = "lembaga";

export type InfoSekolahQuery = { jenjang: string; search: string; page: number };

/** Path daftar → URL dengan `?jenjang=&search=&page=`; nilai kosong dan halaman 1 tidak ditulis. */
export function buildListHref(path: string, query: Partial<InfoSekolahQuery> = {}): string {
  const params = new URLSearchParams();
  const jenjang = query.jenjang?.trim().toLowerCase();
  const search = query.search?.trim();
  if (jenjang) params.set("jenjang", jenjang);
  if (search) params.set("search", search);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Satu pil jenjang di kepala daftar (bentuk `KabarListTab`). */
export type JenjangTab = { key: string; label: string; href: string; active: boolean };

/**
 * Pil "Semua" + satu pil per jenjang (key huruf kecil = nilai URL), urut `JENJANG_ORDER` lalu A–Z.
 * Jenjang aktif yang belum/tidak ada di daftar tetap dimunculkan agar pilihan di URL selalu terlihat.
 * Tautan pil mempertahankan kata kunci dan kembali ke halaman 1.
 */
export function jenjangTabs(names: readonly string[], query: Pick<InfoSekolahQuery, "jenjang" | "search">, path: string): JenjangTab[] {
  const active = query.jenjang.trim().toLowerCase();
  const options = new Map<string, string>();
  for (const nama of names) {
    const key = nama.trim().toLowerCase();
    if (key && !options.has(key)) options.set(key, nama.trim());
  }
  if (active && !options.has(active)) options.set(active, query.jenjang.trim().toUpperCase());
  const sorted = [...options.entries()].sort(([a], [b]) => compareJenjang(a, b));
  return [
    { key: "", label: "Semua", href: buildListHref(path, { search: query.search }), active: !active },
    ...sorted.map(([key, label]) => ({
      key,
      label,
      href: buildListHref(path, { jenjang: key, search: query.search }),
      active: key === active,
    })),
  ];
}

/** Pesan saat daftar kosong: beda antara memang belum ada data dan hasil filter/pencarian yang nihil. */
export function emptyMessage(noun: string, query: Pick<InfoSekolahQuery, "jenjang" | "search">): string {
  const search = query.search.trim();
  if (search && query.jenjang) return `Tidak ada ${noun} “${search}” di jenjang ${query.jenjang.toUpperCase()}.`;
  if (search) return `Tidak ada ${noun} yang cocok dengan “${search}”.`;
  if (query.jenjang) return `Belum ada data ${noun} di jenjang ${query.jenjang.toUpperCase()}.`;
  return `Belum ada data ${noun}.`;
}

/** Respons `GET /pendidikan/ringkasan/stats` (angka gabungan, tanpa nama). */
export type StatsPendidikan = {
  perJenjang: { nama: string; jumlahSiswa: number; jumlahPengajar: number }[];
  jumlahLembaga: number;
  jumlahPengajar: number;
};

/** Kolom lembaga yang dipakai halaman publik. */
export type LembagaItem = { id: string; nama: string; jenjangPendidikan: { nama: string } | null };

export type JenjangGroup = {
  /** Nama jenjang huruf kecil (kunci warna & URL). */
  key: string;
  nama: string;
  lembaga: { id: string; nama: string }[];
  /** `null` = jenjang tidak ada di statistik (mis. jenjang nonaktif); angka tidak dikarang. */
  jumlahSiswa: number | null;
  jumlahPengajar: number | null;
  /** Porsi lembaga jenjang ini dari semua lembaga (%), untuk batang sebaran. */
  width: number;
};

export type InfoSekolahRingkasan = {
  totalLembaga: number;
  totalSiswa: number;
  totalPengajar: number;
  groups: JenjangGroup[];
};

/** Jenjang lembaga yang data jenjangnya hilang (relasi wajib, jadi seharusnya tidak terjadi). */
const JENJANG_TANPA_NAMA = "Jenjang lain";

/**
 * Susun ringkasan halaman: lembaga dikelompokkan per jenjang (urut baku), tiap kelompok diberi jumlah siswa &
 * pengajar dari statistik. Total siswa/pengajar = jumlah per jenjang, supaya ubin dan rincian selalu cocok.
 * Jenjang tanpa lembaga tidak dibuat kelompok (angkanya pasti 0, karena statistik dihitung dari lembaga).
 */
export function buildRingkasan(stats: StatsPendidikan, lembaga: readonly LembagaItem[], totalLembaga = lembaga.length): InfoSekolahRingkasan {
  const perJenjang = new Map(stats.perJenjang.map((j) => [j.nama.trim().toLowerCase(), j]));
  const groups = new Map<string, JenjangGroup>();
  for (const item of lembaga) {
    const nama = item.jenjangPendidikan?.nama.trim() || JENJANG_TANPA_NAMA;
    const key = nama.toLowerCase();
    let group = groups.get(key);
    if (!group) {
      const stat = perJenjang.get(key);
      group = { key, nama, lembaga: [], jumlahSiswa: stat?.jumlahSiswa ?? null, jumlahPengajar: stat?.jumlahPengajar ?? null, width: 0 };
      groups.set(key, group);
    }
    group.lembaga.push({ id: item.id, nama: item.nama });
  }
  const shown = lembaga.length || 1;
  const sorted = [...groups.values()].sort((a, b) => compareJenjang(a.nama, b.nama));
  for (const group of sorted) {
    group.lembaga.sort((a, b) => a.nama.localeCompare(b.nama, "id", { numeric: true, sensitivity: "base" }));
    group.width = (group.lembaga.length / shown) * 100;
  }
  return {
    totalLembaga,
    totalSiswa: sum(stats.perJenjang.map((j) => j.jumlahSiswa)),
    totalPengajar: sum(stats.perJenjang.map((j) => j.jumlahPengajar)),
    groups: sorted,
  };
}

function sum(values: readonly number[]): number {
  return values.reduce((acc, n) => acc + (Number.isFinite(n) ? n : 0), 0);
}

/** Angka format Indonesia (`1.234`). */
export function formatJumlah(n: number): string {
  return n.toLocaleString("id-ID");
}
