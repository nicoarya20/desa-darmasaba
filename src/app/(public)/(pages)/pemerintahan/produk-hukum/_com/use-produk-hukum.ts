import { useEffect, useState } from 'react';
import type { ProdukHukumRecord } from '@/lib/produk-hukum';
import { loadProdukHukum, type ProdukHukumQuery } from './produk-hukum.source';

/** Keadaan satu halaman daftar: memuat, gagal, atau siap (bentuk `ready` juga dibaca `outOfRangePage`). */
export type ProdukHukumListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: ProdukHukumRecord[]; total: number; totalPages: number };

type Loaded = { key: string; state: Exclude<ProdukHukumListState, { status: 'loading' }> };

/**
 * Muat satu halaman untuk kombinasi halaman/kategori/kata kunci; ganti query → muat ulang. Hasil query lama dianggap
 * usang (tampil kerangka). `knownTotal` = jumlah entri hasil muat sukses terakhir (null sebelum ada), agar kolom cari
 * tidak berkedip saat berpindah halaman.
 */
export function useProdukHukumList(query: ProdukHukumQuery): { state: ProdukHukumListState; knownTotal: number | null } {
  const { page, limit, search, kategori } = query;
  const key = `${page}|${limit}|${kategori}|${search}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [knownTotal, setKnownTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadProdukHukum({ page, limit, search, kategori }).then(
      (data) => {
        if (cancelled) return;
        setKnownTotal(data.total);
        setLoaded({ key, state: { status: 'ready', ...data } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat produk hukum (halaman ${page}, kategori "${kategori || 'semua'}"):`, error);
        if (!cancelled) setLoaded({ key, state: { status: 'error' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, page, limit, search, kategori]);

  return { state: loaded?.key === key ? loaded.state : { status: 'loading' }, knownTotal };
}
