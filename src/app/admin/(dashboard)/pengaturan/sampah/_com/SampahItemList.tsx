'use client';
import { Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { SampahItem } from '@/lib/sampah/sampah-item';
import { teksSampahKosong } from '../_lib/sampah-view.logic';
import { SampahItemCard, type SampahItemAksi } from './SampahItemCard';

const JUMLAH_SKELETON = 4;

type Props = SampahItemAksi & {
  items: readonly SampahItem[];
  loading: boolean;
  /** Nama kelompok aktif untuk teks empty state. */
  namaKelompok: string;
  cari: string;
};

/** Daftar item Sampah: skeleton saat memuat pertama, empty state per tab, atau kartu bertumpuk. */
export function SampahItemList({ items, loading, namaKelompok, cari, ...aksi }: Props) {
  if (loading && items.length === 0) {
    return (
      <Stack gap="xs" data-testid="sampah-skeleton">
        {Array.from({ length: JUMLAH_SKELETON }, (_, i) => (
          <Skeleton key={i} h={80} radius="md" />
        ))}
      </Stack>
    );
  }

  if (items.length === 0) {
    return (
      <Paper withBorder radius="md" p="xl" data-testid="sampah-kosong">
        <Stack align="center" gap="xs">
          <IconTrash size={32} stroke={1.5} color="var(--mantine-color-gray-5)" />
          <Text fz="sm" c="dimmed" ta="center">
            {teksSampahKosong(namaKelompok, cari)}
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="xs" style={{ opacity: loading ? 0.6 : 1 }}>
      {items.map((item) => (
        <SampahItemCard key={item.id} item={item} {...aksi} />
      ))}
    </Stack>
  );
}
