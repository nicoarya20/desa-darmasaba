import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import ApiFetch from '@/lib/api-fetch';
import type { AgendaItem } from './kalender.logic';

/** Bentuk acara dari find-many (tanggal bisa Date atau string ISO tergantung transport). */
type AgendaApiItem = {
  id: string;
  nama: string;
  tanggal: string | Date;
  tanggalSelesai?: string | Date | null;
  kategori?: string | null;
  lokasi?: string | null;
  deskripsi?: string | null;
};

const iso = (v: string | Date) => (typeof v === 'string' ? v : v.toISOString());

/** Normalisasi satu acara API ke bentuk halaman publik. */
export function toAgendaItem(raw: AgendaApiItem): AgendaItem {
  return {
    id: raw.id,
    nama: raw.nama,
    tanggal: iso(raw.tanggal),
    tanggalSelesai: raw.tanggalSelesai ? iso(raw.tanggalSelesai) : null,
    kategori: raw.kategori ?? 'LAINNYA',
    lokasi: raw.lokasi ?? '',
    deskripsi: raw.deskripsi?.trim() ? raw.deskripsi : null,
  };
}

async function findMany(query: Record<string, string | number | boolean>, sumber: string) {
  const res = await ApiFetch.api.desa.eventbudaya['find-many'].get({ query });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<AgendaApiItem>(sumber, res.status, body).map(toAgendaItem);
  return { items, total: Number(body?.total) || items.length };
}

/** Semua acara aktif yang menyentuh `tahun` (WITA), urut tanggal naik. */
export async function loadAgendaTahun(tahun: number, limit: number): Promise<AgendaItem[]> {
  const { items } = await findMany({ page: 1, limit, tahun }, `agenda tahun ${tahun}`);
  return items;
}

/** Acara yang belum lewat (termasuk yang sedang berlangsung), terdekat dulu, plus jumlah totalnya. */
export async function loadAgendaMendatang(limit: number): Promise<{ items: AgendaItem[]; total: number }> {
  return findMany({ page: 1, limit, mendatang: 'true' }, 'agenda mendatang');
}
