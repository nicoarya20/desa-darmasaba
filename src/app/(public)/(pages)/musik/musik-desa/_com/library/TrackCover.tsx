import { IconMusic } from '@tabler/icons-react';
import type { CSSProperties } from 'react';
import { COVER_GRADIENTS, pickFromPalette } from './musik-palette';
import s from './track-cover.module.css';

type Props = {
  src: string | null;
  alt: string;
  /** Sisi persegi dalam px, atau 'fill' untuk mengikuti lebar wadah. Bawaan 'fill'. */
  size?: number | 'fill';
  /** Radius sudut px. Bawaan 4. */
  radius?: number;
  /** Penentu gradasi cadangan (mis. id atau judul lagu). */
  seed: string;
};

/** Sampul lagu persegi: gambar lazy di atas gradasi gelap + ikon musik sebagai cadangan. */
export function TrackCover({ src, alt, size = 'fill', radius = 4, seed }: Props) {
  const style: CSSProperties = {
    borderRadius: radius,
    background: pickFromPalette(COVER_GRADIENTS, seed),
    ...(size === 'fill' ? {} : { width: size, height: size }),
  };
  const iconSize = size === 'fill' ? 40 : Math.max(16, Math.round(size * 0.36));

  return (
    <span className={s.cover} style={style} data-size={size === 'fill' ? 'fill' : 'fixed'}>
      <IconMusic size={iconSize} stroke={1.5} className={s.icon} aria-hidden="true" />
      {src ? (
        // Gambar biasa (bukan next/image) seperti pola situs; retry error ditangani ImageErrorRetryMount global.
        // eslint-disable-next-line @next/next/no-img-element -- sampul dari MinIO via /api, ukuran kecil & lazy
        <img src={src} alt={alt} loading="lazy" decoding="async" className={s.img} />
      ) : (
        <span className={s.srOnly}>{alt}</span>
      )}
    </span>
  );
}
