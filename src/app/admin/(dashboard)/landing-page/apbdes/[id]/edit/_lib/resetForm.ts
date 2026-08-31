// Logika murni tombol "Batal" pada Edit APBDes.
// Dipisah dari komponen presentasi agar bisa diuji tanpa render React.

export type ApbdesItemForm = {
  id?: string; // id item lama; dipertahankan agar realisasi tetap ter-link
  kode: string;
  uraian: string;
  anggaran: number;
  level: number;
  tipe: 'pendapatan' | 'belanja' | 'pembiayaan';
  // Field kalkulasi selalu terisi saat load (fallback 0), sesuai bentuk item
  // di state form (Zod `.default(0)` → wajib number).
  realisasi: number;
  selisih: number;
  persentase: number;
};

export type ApbdesOriginalData = {
  tahun: number;
  name: string;
  deskripsi: string;
  jumlah: string;
  imageId: string;
  fileId: string;
  imageUrl: string;
  fileUrl: string;
  items: ApbdesItemForm[]; // snapshot item awal
};

/**
 * Salin daftar item menjadi objek-objek baru yang independen, sehingga edit
 * pada form berikutnya tidak memutasi snapshot original (dan sebaliknya).
 */
export function cloneApbdesItems(items: ApbdesItemForm[]): ApbdesItemForm[] {
  return items.map((it) => ({ ...it }));
}

/**
 * Bentuk form hasil klik "Batal": kembalikan seluruh field top-level DAN item
 * ke kondisi awal (dari snapshot), dengan salinan item yang independen.
 */
export function buildResetForm(original: ApbdesOriginalData) {
  return {
    tahun: original.tahun,
    name: original.name,
    deskripsi: original.deskripsi,
    jumlah: original.jumlah,
    imageId: original.imageId,
    fileId: original.fileId,
    items: cloneApbdesItems(original.items),
  };
}
