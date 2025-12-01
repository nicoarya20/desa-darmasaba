/* eslint-disable @typescript-eslint/no-explicit-any */
export type APBDesTipe = 'pendapatan' | 'belanja' | 'pembiayaan';

export function isAPBDesTipe(tipe: string | null | undefined): tipe is APBDesTipe {
  return tipe === 'pendapatan' || tipe === 'belanja' || tipe === 'pembiayaan';
}

export interface APBDesItem {
  id: string;
  kode: string;
  uraian: string;
  anggaran: number;
  realisasi: number;
  selisih: number;
  persentase: number;
  level: number;
  tipe?: APBDesTipe | null;
  // Additional fields from API
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  isActive?: boolean;
  apbdesId?: string;
}

export interface APBDesData {
  id: string;
  tahun: number | null;
  items: APBDesItem[];
  image?: { id: string; url: string } | null;
  file?: { id: string; url: string } | null;
}

export function transformAPBDesData(data: any): APBDesData {
  return {
    ...data,
    items: data.items.map((item: any) => ({
      ...item,
      tipe: isAPBDesTipe(item.tipe) ? item.tipe : null
    }))
  };
}
