import { IconMusic } from '@tabler/icons-react';
import s from './now-playing-cover.module.css';

/** Sampul lagu persegi (dekoratif: nama lagu dibaca dari tautan/tombol pemakai); tanpa gambar → ikon musik. */
export function NowPlayingCover({ src, className }: { src: string | null; className?: string }) {
  return (
    <span className={`${s.cover} ${className ?? ''}`} aria-hidden="true">
      <IconMusic className={s.icon} stroke={1.5} />
      {src && (
        // Gambar biasa (bukan next/image) seperti pola situs; retry error ditangani ImageErrorRetryMount global.
        // eslint-disable-next-line @next/next/no-img-element -- sampul kecil dari MinIO via /api
        <img src={src} alt="" decoding="async" className={s.img} />
      )}
    </span>
  );
}
