'use client';
import type { PengumumanFile } from '@/lib/pengumuman-lampiran';
import { Anchor, Box, Image, Stack } from '@mantine/core';
import { DokumentasiGaleri } from '@/app/(public)/(tambahan)/program-inovasi/[id]/_com/DokumentasiGaleri';
import { PengumumanDokumenList } from './PengumumanDokumenList';

type Props = {
  judul: string;
  image?: PengumumanFile | null;
  images?: PengumumanFile[] | null;
  dokumen?: PengumumanFile[] | null;
  /** `false` = tanpa judul section (detail admin sudah memberi label per bagian). */
  denganJudul?: boolean;
};

/** Gambar utama di atas konten pengumuman (klik = buka ukuran penuh); tidak dirender bila kosong. */
export function PengumumanGambarUtama({ image, judul }: { image?: PengumumanFile | null; judul: string }) {
  if (!image?.link) return null;
  return (
    <Anchor href={image.link} target="_blank" rel="noopener noreferrer" aria-label="Lihat gambar ukuran penuh" data-pengumuman-gambar-utama>
      <Image src={image.link} alt={judul} radius="md" fit="contain" mah={{ base: 420, md: 640 }} w="100%" loading="lazy" />
    </Anchor>
  );
}

/** Thumbnail kartu list (gambar utama, rasio 16:9); tidak dirender bila pengumuman tanpa gambar. */
export function PengumumanThumbnail({ image, judul }: { image?: { link: string } | null; judul: string }) {
  if (!image?.link) return null;
  return (
    <Box style={{ aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 'var(--mantine-radius-md)' }} data-pengumuman-thumbnail>
      <Image src={image.link} alt={judul} h="100%" w="100%" fit="cover" loading="lazy" />
    </Box>
  );
}

/** Lampiran pengumuman setelah konten: galeri gambar + dokumen PDF; bagian kosong tidak ditampilkan. */
export function PengumumanLampiranBawah({ images, dokumen, denganJudul = true }: Omit<Props, 'judul' | 'image'>) {
  const adaGaleri = (images ?? []).length > 0;
  const adaDokumen = (dokumen ?? []).length > 0;
  if (!adaGaleri && !adaDokumen) return null;
  return (
    <Stack gap="lg" w="100%">
      <DokumentasiGaleri images={images} judul={denganJudul ? 'Galeri' : null} alt="Gambar pengumuman" />
      <PengumumanDokumenList dokumen={dokumen} judul={denganJudul ? 'Lampiran Dokumen' : null} />
    </Stack>
  );
}
