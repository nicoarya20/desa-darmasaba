'use client';
import { Image } from '@mantine/core';
import { useState, type ReactNode } from 'react';
import { youtubeThumbUrl } from './pencegahan.logic';
import { YOUTUBE_MISSING_THUMB_MAX_WIDTH } from './pencegahan.meta';

type Props = {
  videoId: string;
  className: string;
  /** Tampil bila pratinjau tidak ada (video dihapus/privat) atau gagal dimuat. */
  fallback: ReactNode;
  /** Bungkus gambar yang berhasil (mis. tombol putar / lencana); bawaan: gambar saja. */
  wrap?: (img: ReactNode) => ReactNode;
};

/**
 * Pratinjau video YouTube. Video yang dihapus/privat tidak punya `hqdefault`: i.ytimg membalas 404 **berisi** gambar
 * abu 120×90 yang tetap dirender Chrome (onError tidak terpicu), jadi lebar asli kecil dianggap "tidak tersedia".
 */
export function YoutubeThumb({ videoId, className, fallback, wrap = (img) => img }: Props) {
  const [missing, setMissing] = useState(false);
  if (missing) return <>{fallback}</>;

  // Cek juga lewat ref: gambar dari cache bisa selesai dimuat sebelum hidrasi, sehingga onLoad React terlewat.
  const check = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0 && img.naturalWidth <= YOUTUBE_MISSING_THUMB_MAX_WIDTH) setMissing(true);
  };

  return (
    <>
      {wrap(
        <Image
          ref={check}
          src={youtubeThumbUrl(videoId)}
          alt=""
          className={className}
          loading="lazy"
          decoding="async"
          onLoad={(event) => check(event.currentTarget)}
          onError={() => setMissing(true)}
        />,
      )}
    </>
  );
}
