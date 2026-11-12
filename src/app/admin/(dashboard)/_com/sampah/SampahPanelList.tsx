'use client';
import { Anchor, Badge, Button, Group, Image, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconFile, IconFileText, IconMusic, IconPhoto, IconRestore, IconTrashX } from '@tabler/icons-react';
import {
  infoItemSampahPanel,
  isGambarSampahPanel,
  labelSisaHariPanel,
  teksSampahPanelKosong,
  warnaSisaHariPanel,
  type SampahPanelItem,
} from './sampah-panel.logic';
import type { SampahPanelBusy } from './sampah-panel.state';

type Props = {
  items: readonly SampahPanelItem[];
  retensiHari: number;
  busy: SampahPanelBusy;
  onPulihkan: (item: SampahPanelItem) => void;
  onHapus: (item: SampahPanelItem) => void;
};

const IKON_KATEGORI = { image: IconPhoto, document: IconFileText, audio: IconMusic, other: IconFile } as const;

/** Thumbnail item: gambar dari `pratinjauUrl`, atau ikon sesuai kategori berkas. */
function SampahThumb({ item }: { item: SampahPanelItem }) {
  if (isGambarSampahPanel(item)) {
    return <Image src={item.pratinjauUrl} alt={item.judul} w={48} h={48} radius="sm" fit="cover" />;
  }
  const Ikon = IKON_KATEGORI[item.kategori] ?? IconFile;
  return (
    <ThemeIcon variant="light" color="gray" size={48} radius="sm" aria-hidden>
      <Ikon size={24} />
    </ThemeIcon>
  );
}

/** Daftar item di Sampah fitur + aksi Pulihkan / Hapus permanen, atau empty state. */
export function SampahPanelList({ items, retensiHari, busy, onPulihkan, onHapus }: Props) {
  if (items.length === 0) {
    return (
      <Text fz="sm" c="dimmed" data-testid="sampah-panel-kosong">
        {teksSampahPanelKosong(retensiHari)}
      </Text>
    );
  }
  return (
    <Stack gap="xs">
      {items.map((item) => {
        const sibuk = busy?.id === item.id;
        return (
          <Paper key={item.id} withBorder radius="md" p="sm" data-sampah-id={item.id}>
            <Group justify="space-between" align="center" gap="sm" wrap="wrap">
              <Group gap="sm" wrap="nowrap" style={{ flex: '1 1 260px', minWidth: 0 }}>
                <SampahThumb item={item} />
                <Stack gap={2} style={{ minWidth: 0 }}>
                  {item.pratinjauUrl ? (
                    <Anchor href={item.pratinjauUrl} target="_blank" rel="noopener noreferrer" fz="sm" fw={600} lineClamp={2}>
                      {item.judul}
                    </Anchor>
                  ) : (
                    <Text fz="sm" fw={600} lineClamp={2} title={item.judul}>
                      {item.judul}
                    </Text>
                  )}
                  <Text fz="xs" c="dimmed">
                    {infoItemSampahPanel(item)}
                  </Text>
                  <Badge variant="light" size="sm" color={warnaSisaHariPanel(item.sisaHari)} w="fit-content">
                    {labelSisaHariPanel(item.sisaHari)}
                  </Badge>
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
      })}
    </Stack>
  );
}
