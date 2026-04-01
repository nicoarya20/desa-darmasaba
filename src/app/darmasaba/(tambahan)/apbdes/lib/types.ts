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
  if (!data) {
    return {
      id: '',
      tahun: null,
      items: [],
      image: null,
      file: null
    };
  }

  return {
    id: data.id || '',
    tahun: data.tahun || null,
    items: Array.isArray(data.items)
      ? data.items.map((item: any) => ({
          id: item.id || '',
          kode: item.kode || '',
          uraian: item.uraian || '',
          anggaran: typeof item.anggaran === 'number' ? item.anggaran : 0,
          // Map totalRealisasi from backend to realisasi field
          realisasi: typeof item.totalRealisasi === 'number' ? item.totalRealisasi : (typeof item.realisasi === 'number' ? item.realisasi : 0),
          selisih: typeof item.selisih === 'number' ? item.selisih : 0,
          persentase: typeof item.persentase === 'number' ? item.persentase : 0,
          level: typeof item.level === 'number' ? item.level : 1,
          tipe: isAPBDesTipe(item.tipe) ? item.tipe : null,
          createdAt: item.createdAt || undefined,
          updatedAt: item.updatedAt || undefined,
          deletedAt: item.deletedAt || null,
          isActive: item.isActive !== undefined ? item.isActive : true,
          apbdesId: item.apbdesId || undefined
        }))
      : [],
    image: data.image ? { id: data.image.id || '', url: data.image.url || '' } : null,
    file: data.file ? { id: data.file.id || '', url: data.file.url || '' } : null
  };
}
