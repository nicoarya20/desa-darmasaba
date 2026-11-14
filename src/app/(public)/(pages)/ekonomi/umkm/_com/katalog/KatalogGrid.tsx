import { Children, isValidElement, type ReactNode } from 'react';
import { KATALOG_CARD_TEXT as T } from './katalog-card.text';
import s from './katalog-grid.module.css';

type Variant = 'produk' | 'toko';

type Props = {
  variant: Variant;
  loading?: boolean;
  skeletonCount?: number;
  /** Ditampilkan bila tidak memuat dan tidak ada kartu. */
  empty?: ReactNode;
  children?: ReactNode;
};

/** Lebar baris kerangka per varian, meniru susunan teks kartu (produk: harga, nama, toko; toko: kategori, nama, pemilik, alamat). */
const SKELETON_LINES: Record<Variant, string[]> = {
  produk: ['45%', '90%', '60%'],
  toko: ['35%', '85%', '60%', '70%'],
};

/** Grid kartu katalog: kerangka saat memuat, slot kosong bila tanpa kartu, selain itu daftar kartu. */
export function KatalogGrid({ variant, loading, skeletonCount = 8, empty, children }: Props) {
  if (loading) {
    return (
      <div className={s.grid} aria-busy="true" aria-label={T.memuat} data-variant={variant}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div key={i} className={s.skeleton} aria-hidden="true">
            <div className={s.skeletonMedia} />
            {SKELETON_LINES[variant].map((width, j) => (
              <div key={j} className={s.skeletonLine} style={{ width }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // toArray membuang null/false, jadi daftar yang hanya berisi kartu tersaring tetap terbaca kosong.
  const items = Children.toArray(children);
  if (items.length === 0) return <>{empty}</>;

  return (
    <ul className={s.grid} data-variant={variant}>
      {items.map((child, i) => (
        <li key={isValidElement(child) && child.key != null ? child.key : i} className={s.item}>
          {child}
        </li>
      ))}
    </ul>
  );
}
