import { Image } from '@mantine/core';
import { IconBook2 } from '@tabler/icons-react';
import s from './buku-sampul.module.css';

type Props = { src: string | null; alt: string; /** Ukuran ikon pengganti. */ iconSize?: number };

/** Bingkai sampul buku rasio potret 2:3; tanpa sampul → ikon buku di atas latar abu. */
export function BukuSampul({ src, alt, iconSize = 40 }: Props) {
  return (
    <div className={s.cover}>
      {src ? (
        <Image src={src} alt={alt} loading="lazy" decoding="async" className={s.img} />
      ) : (
        <span className={s.fallback} aria-hidden="true">
          <IconBook2 size={iconSize} stroke={1.5} />
        </span>
      )}
    </div>
  );
}
