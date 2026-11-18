'use client';
import { Image } from '@mantine/core';
import { useState } from 'react';
import s from './program-tiles.module.css';

type Props = {
  /** URL logo; kosong → langsung inisial. */
  src?: string;
  /** Pengganti logo yang tidak ada / gagal dimuat; kosong → pelat kosong. */
  initials?: string;
};

/**
 * Pelat logo ubin program: logo `contain` di tengah pelat bertinggi tetap. Logo tidak ada atau gagal dimuat (onError)
 * → inisial nama (dekoratif, aria-hidden; nama program sudah dibaca dari judul ubin).
 */
export function ProgramTileLogo({ src, initials }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span className={s.logo}>
      {showImage ? (
        <Image className={s.logoImg} src={src} alt="" fit="contain" loading="lazy" onError={() => setFailedSrc(src ?? null)} />
      ) : initials ? (
        <span className={s.initials} aria-hidden>
          {initials}
        </span>
      ) : null}
    </span>
  );
}
