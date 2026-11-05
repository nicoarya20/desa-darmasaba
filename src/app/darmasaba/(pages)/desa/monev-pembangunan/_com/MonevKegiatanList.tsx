'use client'
import PembangunanInfo from '@/app/darmasaba/(pages)/desa/kegiatan-desa/_com/PembangunanInfo';
import colors from '@/con/colors';
import type { MonevKegiatan } from '@/app/admin/(dashboard)/_state/desa/monevPembangunan';
import { rkpSourceLabel, type RkpRef } from '@/lib/dokumen-perencanaan';
import { Anchor, Button, Center, Image, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';

const SKELETON_COUNT = 6;

/** Daftar kartu kegiatan pembangunan dengan progres; menangani loading & empty-state. */
export default function MonevKegiatanList({
  items,
  loading,
  filtered,
  rkpIndex,
}: {
  items: MonevKegiatan[];
  loading: boolean;
  filtered: boolean;
  /** Indeks RKP per tahun; bila ada, kartu diberi label "Bersumber dari RKP Desa {tahun}". */
  rkpIndex?: ReadonlyMap<number, RkpRef>;
}) {
  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => <Skeleton key={i} h={320} radius="lg" />)}
      </SimpleGrid>
    );
  }

  if (items.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed" fz="sm" ta="center">
          {filtered
            ? 'Tidak ada kegiatan pembangunan dengan status ini.'
            : 'Belum ada data kegiatan pembangunan. Data akan tampil setelah ditambahkan oleh admin desa.'}
        </Text>
      </Center>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {items.map((item) => {
        const rkp = rkpIndex ? rkpSourceLabel(item.tanggal, rkpIndex) : null;
        return (
        <Paper key={item.id} shadow="sm" radius="lg" withBorder style={{ overflow: 'hidden' }}>
          {item.image?.link && (
            <Image src={item.image.link} h={160} alt={item.judul} fit="cover" loading="lazy" />
          )}
          <Stack p="md" gap="sm">
            <Title order={4} c={colors['blue-button']} lineClamp={2}>{item.judul}</Title>
            <Text fz="xs" c="dimmed" lineClamp={1}>
              <IconMapPin size={12} style={{ verticalAlign: 'middle' }} /> {item.lokasi || '-'}
            </Text>
            <PembangunanInfo item={item} showSumberDana />
            {rkp && (
              <Text fz="xs" c="dimmed">
                {rkp.fileLink ? (
                  <Anchor href={rkp.fileLink} target="_blank" rel="noreferrer" fz="xs">{rkp.label}</Anchor>
                ) : (
                  rkp.label
                )}
              </Text>
            )}
            <Button
              component={Link}
              href={`/darmasaba/desa/kegiatan-desa/pembangunan/${item.id}`}
              variant="light"
              size="compact-sm"
              radius="md"
            >
              Lihat Detail
            </Button>
          </Stack>
        </Paper>
        );
      })}
    </SimpleGrid>
  );
}
