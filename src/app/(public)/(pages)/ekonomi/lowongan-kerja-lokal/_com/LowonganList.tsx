import { Children, isValidElement, type ReactNode } from 'react';
import { LOWONGAN_CARD_TEXT as T } from './lowongan-card.text';
import s from './lowongan-list.module.css';

type Props = {
  loading?: boolean;
  skeletonCount?: number;
  /** Ditampilkan bila tidak memuat dan tidak ada kartu. */
  empty?: ReactNode;
  children?: ReactNode;
};

/** Lebar dua garis teks kerangka (posisi, pemberi kerja). */
const SKELETON_LINES = ['46%', '28%'];
/** Lebar tiga pil kerangka (tipe, gaji, lokasi). */
const SKELETON_PILLS = [96, 168, 132];

/** Daftar kartu lowongan: kerangka saat memuat, slot kosong bila tanpa kartu, selain itu satu `<li>` per kartu. */
export function LowonganList({ loading, skeletonCount = 4, empty, children }: Props) {
  if (loading) {
    return (
      <div className={s.list} aria-busy="true" aria-label={T.memuat}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div key={i} className={s.skeleton} aria-hidden="true">
            <div className={s.skeletonHead}>
              <div className={s.skeletonLogo} />
              <div className={s.skeletonText}>
                {SKELETON_LINES.map((width, j) => (
                  <div key={j} className={s.skeletonLine} style={{ width }} />
                ))}
              </div>
            </div>
            <div className={s.skeletonPills}>
              {SKELETON_PILLS.map((width, j) => (
                <div key={j} className={s.skeletonPill} style={{ width }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // toArray membuang null/false, jadi daftar yang hanya berisi kartu tersaring tetap terbaca kosong.
  const items = Children.toArray(children);
  if (items.length === 0) return <>{empty}</>;

  return (
    <ul className={s.list}>
      {items.map((child, i) => (
        <li key={isValidElement(child) && child.key != null ? child.key : i} className={s.item}>
          {child}
        </li>
      ))}
    </ul>
  );
}
