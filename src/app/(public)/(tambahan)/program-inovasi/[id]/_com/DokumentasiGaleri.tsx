'use client';
import { Box, Image, Modal, SimpleGrid, Stack, Title, UnstyledButton } from '@mantine/core';
import { useState } from 'react';

/** Gambar galeri minimal yang dibutuhkan untuk ditampilkan. */
export type GambarDokumentasi = { id: string; link: string; realName?: string | null };

type Props = {
  images: GambarDokumentasi[] | null | undefined;
  /** Judul section; `null` = tanpa judul (mis. di detail admin yang sudah punya label). */
  judul?: string | null;
  alt?: string;
};

/** Section galeri "Dokumentasi" Program Inovasi: grid responsif, klik → lihat besar; tidak dirender bila kosong. */
export function DokumentasiGaleri({ images, judul = 'Dokumentasi', alt = 'Dokumentasi program' }: Props) {
  const [aktif, setAktif] = useState<GambarDokumentasi | null>(null);
  const daftar = (images ?? []).filter((img) => !!img.link);
  if (daftar.length === 0) return null;

  return (
    <Stack gap="sm" w="100%" component="section" aria-label={judul ?? alt}>
      {judul && (
        <Title order={2} fz={{ base: 'lg', md: 'xl' }} fw={700}>
          {judul}
        </Title>
      )}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
        {daftar.map((img, index) => (
          <UnstyledButton
            key={img.id}
            onClick={() => setAktif(img)}
            aria-label={`Lihat ${alt} ${index + 1}`}
            data-dokumentasi-item
          >
            <Box style={{ aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 'var(--mantine-radius-md)' }}>
              <Image src={img.link} alt={`${alt} ${index + 1}`} h="100%" w="100%" fit="cover" loading="lazy" />
            </Box>
          </UnstyledButton>
        ))}
      </SimpleGrid>

      <Modal opened={aktif !== null} onClose={() => setAktif(null)} size="xl" centered title={aktif?.realName ?? undefined}>
        {aktif && <Image src={aktif.link} alt={alt} fit="contain" mah="75vh" radius="md" />}
      </Modal>
    </Stack>
  );
}
