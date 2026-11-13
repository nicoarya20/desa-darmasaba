// Types for APBDes data structure

export interface APBDesItem {
  id?: string;
  kode: string;
  uraian: string;
  deskripsi?: string;
  tipe: 'pendapatan' | 'belanja' | 'pembiayaan' | null;
  anggaran: number;
  level?: number;
  // Calculated fields
  realisasi?: number;
  selisih?: number;
  persentase?: number;
  // Realisasi items (nested)
  realisasiItems?: RealisasiItem[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RealisasiItem {
  id: string;
  kode: string;
  keterangan?: string;
  jumlah: number;
  tanggal?: string | Date;
  apbDesItemId: string;
  buktiFileId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface APBDes {
  id: string;
  name?: string | null;
  tahun: number;
  jumlah: number;
  deskripsi?: string | null;
  items?: APBDesItem[];
  file?: {
    id: string;
    link: string;
    name?: string;
  } | null;
  fileId?: string;
  // Dokumen per folder (respons API terbaru); kosong/tidak ada pada data lama → fallback ke `file`.
  folders?: APBDesFolderDokumen[];
  dokumenUmum?: APBDesDokumen[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/** Satu dokumen APBDes (aktif) beserta berkasnya. */
export interface APBDesDokumen {
  id: string;
  judul: string;
  urutan?: number;
  file: { id: string; link: string; realName?: string; mimeType?: string | null };
}

/** Folder dokumen APBDes (satu tingkat) beserta dokumennya, terurut. */
export interface APBDesFolderDokumen {
  id: string;
  nama: string;
  urutan?: number;
  dokumen: APBDesDokumen[];
}

export interface APBDesResponse {
  id: string;
  tahun: number;
  name?: string | null;
  jumlah: number;
  items?: APBDesItem[];
  file?: {
    id: string;
    link: string;
  } | null;
}

export interface SummaryData {
  title: string;
  totalAnggaran: number;
  totalRealisasi: number;
  persentase: number;
}

export interface FilterState {
  search: string;
  tipe: 'all' | 'pendapatan' | 'belanja' | 'pembiayaan';
  sortBy: 'uraian' | 'anggaran' | 'realisasi' | 'persentase';
  sortOrder: 'asc' | 'desc';
}

export type LoadingState = {
  initial: boolean;
  changingYear: boolean;
};
