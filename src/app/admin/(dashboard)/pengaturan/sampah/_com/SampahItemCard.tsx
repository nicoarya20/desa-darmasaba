'use client';
import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconRestore, IconTrashX } from '@tabler/icons-react';
import type { SampahItem } from '@/lib/sampah/sampah-item';
import type { SampahBusy } from '../../../_state/pengaturan/sampah-state';
import { infoItemSampah, labelSisaHariSampah, warnaSisaHari } from '../_lib/sampah-view.logic';
import { SampahThumbnail } from './SampahThumbnail';

export type SampahItemAksi = {
  busy: SampahBusy;
  onPulihkan: (item: SampahItem) => void;
  onHapus: (item: SampahItem) => void;
  onPratinjau: (item: SampahItem) => void;
};

/** Satu item Sampah: thumbnail, judul, asal, ukuran, tanggal hapus, badge sisa hari, aksi Pulihkan/Hapus permanen. */
export function SampahItemCard({ item, busy, onPulihkan, onHapus, onPratinjau }: { item: SampahItem } & SampahItemAksi) {
  const info = infoItemSampah(item);
  const sibuk = busy?.id === item.id;

  return (
    <Paper withBorder radius="md" p="sm" data-sampah-id={item.id}>
      <Group justify="space-between" align="center" gap="sm" wrap="wrap">
        <Group gap="sm" wrap="nowrap" align="flex-start" style={{ flex: '1 1 280px', minWidth: 0 }}>
          <SampahThumbnail item={item} onPratinjau={onPratinjau} />
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text fz="sm" fw={600} lineClamp={2} title={item.judul}>
              {item.judul}
            </Text>
            <Text fz="xs" c="dimmed" data-testid="sampah-asal">
              {info.asal}
            </Text>
            <Group gap={6} wrap="wrap">
              <Text fz="xs" c="dimmed">
                {info.ukuran} · {info.dihapus}
              </Text>
              <Badge size="sm" variant="light" color={warnaSisaHari(item.sisaHari)} data-testid="sampah-sisa-hari">
                {labelSisaHariSampah(item.sisaHari)}
              </Badge>
            </Group>
          </Stack>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <Button
            size="xs"
            variant="light"
            leftSection={<IconRestore size={14} />}
            loading={sibuk && busy?.aksi === 'pulihkan'}
            disabled={sibuk}
            onClick={() => onPulihkan(item)}
            aria-label={`Pulihkan ${item.judul}`}
          >
            Pulihkan
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<IconTrashX size={14} />}
            loading={sibuk && busy?.aksi === 'hapus'}
            disabled={sibuk}
            onClick={() => onHapus(item)}
            aria-label={`Hapus permanen ${item.judul}`}
          >
            Hapus permanen
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
