import { HARGA_MENYESUAIKAN } from '@/lib/umkm/harga-produk';
import { hargaParts } from './katalog/katalog-card.logic';
import type { KatalogProduk } from './katalog/katalog.types';

type Props = {
  produk: Pick<KatalogProduk, 'harga' | 'satuan' | 'hargaMenyesuaikan'>;
  /** Kelas dari modul CSS pemakai (kartu katalog / kolom info detail). */
  classes: { price: string; amount: string; unit: string };
};

/**
 * Baris harga produk: angka + satuan; "Harga menyesuaikan" bila admin mengosongkan harga (harga tidak tetap);
 * tidak dirender bila admin menyembunyikan semua harga (saklar di tab Produk).
 */
export function HargaProduk({ produk, classes }: Props) {
  const parts = hargaParts(produk);
  if (parts) {
    return (
      <p className={classes.price}>
        <span className={classes.amount}>{parts.harga}</span>
        {parts.satuan && <span className={classes.unit}>{parts.satuan}</span>}
      </p>
    );
  }
  if (!produk.hargaMenyesuaikan) return null;
  return (
    <p className={classes.price}>
      <span className={classes.unit}>{HARGA_MENYESUAIKAN}</span>
    </p>
  );
}
