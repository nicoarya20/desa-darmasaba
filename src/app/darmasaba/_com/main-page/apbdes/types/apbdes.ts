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
  image?: {
    id: string;
    link: string;
    name?: string;
    path?: string;
  } | null;
  file?: {
    id: string;
    link: string;
    name?: string;
  } | null;
  imageId?: string;
  fileId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface APBDesResponse {
  id: string;
  tahun: number;
  name?: string | null;
  jumlah: number;
  items?: APBDesItem[];
  image?: {
    id: string;
    link: string;
  } | null;
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
