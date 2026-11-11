'use client'
import {
  STATUS_PEMBANGUNAN_COLOR,
  STATUS_PEMBANGUNAN_LABEL,
  formatRupiah,
  isStatusPembangunan,
} from '@/lib/kegiatan-pembangunan';
import { Badge, Group, Progress, Stack, Text } from '@mantine/core';

export type PembangunanInfoItem = {
  statusPembangunan?: string | null;
  progres?: number | null;
  anggaran?: number | null;
  sumberDana?: string | null;
};

/** Status, progress bar, anggaran (Rupiah), dan sumber dana sebuah kegiatan Pembangunan. */
export default function PembangunanInfo({
  item,
  showSumberDana = false,
}: {
  item: PembangunanInfoItem;
  showSumberDana?: boolean;
}) {
  const status = isStatusPembangunan(item.statusPembangunan) ? item.statusPembangunan : null;
  const color = status ? STATUS_PEMBANGUNAN_COLOR[status] : 'gray';
  const progres = item.progres ?? 0;

  return (
    <Stack gap={6} w="100%">
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Badge color={color} variant="light" size="sm" radius="md">
          {status ? STATUS_PEMBANGUNAN_LABEL[status] : 'Status belum diisi'}
        </Badge>
        <Text fz="xs" fw={600} c="dimmed">
          {progres}%
        </Text>
      </Group>
      <Progress value={progres} color={color} size="md" radius="xl" aria-label={`Progres pembangunan ${progres} persen`} />
      <Text fz="xs" c="dimmed">
        Anggaran: <Text component="span" fz="xs" fw={600} c="dark">{formatRupiah(item.anggaran)}</Text>
      </Text>
      {showSumberDana && item.sumberDana && (
        <Text fz="xs" c="dimmed">
          Sumber dana: <Text component="span" fz="xs" fw={600} c="dark">{item.sumberDana}</Text>
        </Text>
      )}
    </Stack>
  );
}
