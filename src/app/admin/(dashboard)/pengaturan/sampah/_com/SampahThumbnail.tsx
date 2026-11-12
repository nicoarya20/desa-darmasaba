'use client';
import { Image, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconFile, IconFileText, IconMusic, IconPhoto, type Icon } from '@tabler/icons-react';
import type { SampahItem, SampahKategori } from '@/lib/sampah/sampah-item';
import { isGambarSampah } from '../_lib/sampah-view.logic';

const UKURAN = 56;

const IKON_KATEGORI: Record<SampahKategori, Icon> = {
  image: IconPhoto,
  document: IconFileText,
  audio: IconMusic,
  other: IconFile,
};

type Props = { item: SampahItem; onPratinjau: (item: SampahItem) => void };

/** Thumbnail item Sampah: gambar via `pratinjauUrl`, ikon per kategori untuk non-gambar; klik = pratinjau. */
export function SampahThumbnail({ item, onPratinjau }: Props) {
  const Ikon = IKON_KATEGORI[item.kategori];
  const isi = isGambarSampah(item) ? (
    <Image src={item.pratinjauUrl} alt={item.judul} w={UKURAN} h={UKURAN} radius="sm" fit="cover" loading="lazy" />
  ) : (
    <ThemeIcon variant="light" color="gray" size={UKURAN} radius="sm" data-kategori={item.kategori}>
      <Ikon size={28} />
    </ThemeIcon>
  );

  if (!item.pratinjauUrl) return isi;
  return (
    <UnstyledButton onClick={() => onPratinjau(item)} aria-label={`Pratinjau ${item.judul}`} style={{ flexShrink: 0 }}>
      {isi}
    </UnstyledButton>
  );
}
