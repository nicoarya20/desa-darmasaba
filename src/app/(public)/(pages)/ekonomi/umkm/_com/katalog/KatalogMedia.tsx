import { Image } from '@mantine/core';
import type { ReactNode } from 'react';
import s from './katalog-media.module.css';

type Props = {
  src: string | null;
  alt: string;
  /** Ikon pengganti saat tidak ada foto. */
  fallback: ReactNode;
  /** Redupkan foto (mis. produk habis). */
  dimmed?: boolean;
  /** Lapisan di atas foto (label pojok). */
  children?: ReactNode;
};

/** Bingkai foto persegi kartu katalog: foto lazy atau ikon pengganti di atas latar abu. */
export function KatalogMedia({ src, alt, fallback, dimmed, children }: Props) {
  return (
    <div className={s.media} data-dimmed={dimmed || undefined}>
      {src ? (
        <Image src={src} alt={alt} loading="lazy" decoding="async" className={s.img} />
      ) : (
        <span className={s.fallback} aria-hidden="true">
          {fallback}
        </span>
      )}
      {children}
    </div>
  );
}
