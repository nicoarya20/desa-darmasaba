import { IconPhoto, IconStar } from '@tabler/icons-react';
import Link from 'next/link';
import { fotoSrc, hargaParts, produkHref, produkLabel } from './katalog-card.logic';
import { KATALOG_CARD_TEXT as T } from './katalog-card.text';
import type { KatalogProduk } from './katalog.types';
import { KatalogMedia } from './KatalogMedia';
import s from './produk-card.module.css';

/** Kartu produk gaya Decathlon: seluruh kartu satu tautan ke detail produk. */
export function ProdukCard({ produk }: { produk: KatalogProduk }) {
  const label = produkLabel(produk);
  const { harga, satuan } = hargaParts(produk);

  return (
    <Link href={produkHref(produk.id)} className={s.card}>
      <KatalogMedia
        src={fotoSrc(produk.imageUrl)}
        alt={produk.nama}
        fallback={<IconPhoto size={40} stroke={1.5} />}
        dimmed={label === 'habis'}
      >
        {label && (
          <span className={s.label} data-variant={label}>
            {T[label]}
          </span>
        )}
      </KatalogMedia>
      <div className={s.body}>
        <p className={s.price}>
          <span className={s.amount}>{harga}</span>
          {satuan && <span className={s.unit}>{satuan}</span>}
        </p>
        <h2 className={s.name}>{produk.nama}</h2>
        {produk.umkm && <p className={s.brand}>{produk.umkm.nama}</p>}
        {/* TODO(umkm-rating): rating belum punya sumber data — docs/BACKEND-TODO.md P3 */}
        <p className={s.rating}>
          <IconStar size={14} stroke={1.75} aria-hidden="true" />
          <span>{T.ratingKosong}</span>
        </p>
      </div>
    </Link>
  );
}
