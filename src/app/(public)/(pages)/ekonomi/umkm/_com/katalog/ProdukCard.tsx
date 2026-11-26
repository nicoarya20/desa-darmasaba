import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import { ULASAN_PRODUK_UMKM_TAMPIL } from '@/con/umkm-ulasan';
import { IconPhoto, IconStar } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { HargaProduk } from '../HargaProduk';
import { fotoSrc, produkHref } from './katalog-card.logic';
import { KATALOG_CARD_TEXT as T } from './katalog-card.text';
import type { KatalogProduk } from './katalog.types';
import { KatalogMedia } from './KatalogMedia';
import s from './produk-card.module.css';

/**
 * Kartu produk gaya Decathlon: seluruh kartu satu tautan ke detail produk.
 * Stok sengaja tidak ditampilkan: pemesanan lewat WhatsApp penjual dan stok tidak dirawat admin (keputusan user 2026-11-13).
 * Baris harga: lihat `HargaProduk` (angka, "Harga menyesuaikan", atau disembunyikan admin); baris rating sementara disembunyikan
 * (src/con/umkm-ulasan.ts).
 */
export function ProdukCard({ produk }: { produk: KatalogProduk }) {
  return (
    <Link href={produkHref(produk.id)} className={`${s.card} ${r.trigger}`}>
      <KatalogMedia
        src={fotoSrc(produk.imageUrl)}
        alt={produk.nama}
        fallback={<IconPhoto size={40} stroke={1.5} />}
      >
        {produk.isUnggulan && <span className={s.label}>{T.unggulan}</span>}
      </KatalogMedia>
      <div className={s.body}>
        <HargaProduk produk={produk} classes={{ price: s.price, amount: s.amount, unit: s.unit }} />
        <h3 className={s.name}>
          <span className={r.title}>{produk.nama}</span>
        </h3>
        {produk.umkm && <p className={s.brand}>{produk.umkm.nama}</p>}
        {/* TODO(umkm-rating): rating belum punya sumber data — docs/BACKEND-TODO.md P3 */}
        {ULASAN_PRODUK_UMKM_TAMPIL && (
          <p className={s.rating}>
            <IconStar size={14} stroke={1.75} aria-hidden="true" />
            <span>{T.ratingKosong}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
