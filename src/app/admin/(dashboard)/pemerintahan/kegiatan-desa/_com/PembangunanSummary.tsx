'use client'
import {
  STATUS_PEMBANGUNAN_COLOR,
  STATUS_PEMBANGUNAN_LABEL,
  isKegiatanPembangunan,
  isStatusPembangunan,
} from '@/lib/kegiatan-pembangunan';
import { Badge, Group, Text } from '@mantine/core';

type Item = {
  kategoriKegiatanId?: string | null;
  statusPembangunan?: string | null;
  progres?: number | null;
};

/** Status + progres ringkas untuk baris daftar admin; kosong bila bukan kegiatan Pembangunan. */
export default function PembangunanSummary({ item }: { item: Item }) {
  if (!isKegiatanPembangunan(item)) return null;

  const status = isStatusPembangunan(item.statusPembangunan) ? item.statusPembangunan : null;

  return (
    <Group gap="xs" mt={4} wrap="wrap">
      <Badge size="sm" variant="light" color={status ? STATUS_PEMBANGUNAN_COLOR[status] : 'gray'}>
        {status ? STATUS_PEMBANGUNAN_LABEL[status] : 'Status belum diisi'}
      </Badge>
      <Text fz="xs" c="dimmed">
        Progres {item.progres ?? 0}%
      </Text>
    </Group>
  );
}
