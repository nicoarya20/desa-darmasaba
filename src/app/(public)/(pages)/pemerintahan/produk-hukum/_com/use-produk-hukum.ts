import { useKeepPrevious } from '@/app/(public)/_com/kabar-list/use-keep-previous';
import type { ProdukHukumRecord } from '@/lib/produk-hukum';
import { useCallback, useState } from 'react';
import { loadProdukHukum, type ProdukHukumQuery } from './produk-hukum.source';

/**
 * Keadaan satu halaman daftar: memuat (muatan pertama), gagal, atau siap (bentuk `ready` juga dibaca `outOfRangePage`).
 * `page` = halaman asal baris (nomor urut tabel); `refreshing` = baris query sebelumnya tetap tampil selama query baru dimuat.
 */
export type ProdukHukumListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: ProdukHukumRecord[]; total: number; totalPages: number; page: number; refreshing: boolean };

/**
 * Muat satu halaman untuk kombinasi halaman/kategori/kata kunci; ganti query → muat ulang sambil mempertahankan baris
 * lama. `knownTotal` = jumlah entri hasil muat sukses terakhir (null sebelum ada, bertahan walau muat berikutnya gagal),
 * agar kolom cari tidak berkedip.
 */
export function useProdukHukumList(query: ProdukHukumQuery): { state: ProdukHukumListState; knownTotal: number | null } {
  const { page, limit, search, kategori } = query;
  const load = useCallback(
    () => loadProdukHukum({ page, limit, search, kategori }).then((data) => ({ ...data, page })),
    [page, limit, search, kategori],
  );
  const loaded = useKeepPrevious(`${page}|${limit}|${kategori}|${search}`, load, `produk hukum (halaman ${page}, kategori "${kategori || 'semua'}")`);

  // Turunan saat render (pola "menyimpan info dari render sebelumnya" di dokumentasi React), bukan efek: tanpa render ganda.
  const [knownTotal, setKnownTotal] = useState<number | null>(null);
  const total = loaded.status === 'ready' ? loaded.data.total : null;
  if (total !== null && total !== knownTotal) setKnownTotal(total);

  const state: ProdukHukumListState =
    loaded.status === 'ready' ? { status: 'ready', ...loaded.data, refreshing: loaded.refreshing } : loaded;
  return { state, knownTotal };
}
