/** Kategori grafik: `name` = label tampil, dicocokkan (huruf kecil) dengan nama opsi dari database. */
export type Category = { readonly name: string; readonly color: string };

export const JENIS_KELAMIN: readonly Category[] = [
  { name: "Laki-laki", color: "#52ABE3FF" },
  { name: "Perempuan", color: "#10A85AFF" },
];

export const RATING: readonly Category[] = [
  { name: "Sangat Baik", color: "#52ABE3FF" },
  { name: "Baik", color: "#10A85AFF" },
  { name: "Kurang Baik", color: "#FFA500" },
  { name: "Sangat Kurang Baik", color: "#FF4500" },
];

export const KELOMPOK_UMUR: readonly Category[] = [
  { name: "Muda", color: "#52ABE3FF" },
  { name: "Dewasa", color: "#10A85AFF" },
  { name: "Lansia", color: "#FFA500" },
];

/** Batas data yang dimuat untuk grafik (halaman 1); total responden tetap dari server. */
export const RESPONDEN_CHART_LIMIT = 1000;
