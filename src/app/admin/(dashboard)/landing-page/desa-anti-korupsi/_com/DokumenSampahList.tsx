'use client';
import { DAK_SAMPAH_RETENSI_HARI } from '@/lib/desa-anti-korupsi-sampah';
import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconRestore, IconTrashX } from '@tabler/icons-react';
import { formatTanggalId, labelFolderAsal, labelSisaHari } from '../_lib/detail-view';
import type { SampahItemView } from '../_lib/sampah-api';

/** Aksi yang sedang berjalan pada satu item sampah (untuk loading tombol). */
export type SampahBusy = { id: string; aksi: 'pulihkan' | 'hapus' } | null;

type Props = {
  items: readonly SampahItemView[];
  /** Folder aktif program, untuk menandai folder asal yang sudah dihapus. */
  folders: readonly { id: string; nama: string }[];
  busy: SampahBusy;
  onPulihkan: (item: SampahItemView) => void;
  onHapus: (item: SampahItemView) => void;
};

/** Keterangan retensi tempat sampah (nilai bawaan backend). */
export const KETERANGAN_SAMPAH = `Dokumen di tempat sampah dihapus permanen otomatis setelah ${DAK_SAMPAH_RETENSI_HARI} hari.`;

/** Daftar ringkas dokumen di tempat sampah + aksi Pulihkan / Hapus permanen. */
export function DokumenSampahList({ items, folders, busy, onPulihkan, onHapus }: Props) {
  return (
    <Stack gap="xs">
      <Text fz="xs" c="dimmed" data-testid="keterangan-sampah">
        {KETERANGAN_SAMPAH}
      </Text>
      {items.length === 0 ? (
        <Text fz="sm" c="dimmed" data-testid="sampah-kosong">
          Tempat sampah kosong
        </Text>
      ) : (
        items.map((item) => {
          const sibuk = busy?.id === item.id;
          return (
            <Paper key={item.id} withBorder radius="md" p="sm" data-sampah-id={item.id}>
              <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
                <Stack gap={2} style={{ flex: '1 1 240px', minWidth: 0 }}>
                  <Text fz="sm" fw={600} lineClamp={2} title={item.judul}>
                    {item.judul}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Dari {labelFolderAsal(item, folders)} · Dihapus {formatTanggalId(item.deletedAt)}
                  </Text>
                  <Text fz="xs" c="orange.8">
                    {labelSisaHari(item.sisaHari)}
                  </Text>
                </Stack>
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
        })
      )}
    </Stack>
  );
}
