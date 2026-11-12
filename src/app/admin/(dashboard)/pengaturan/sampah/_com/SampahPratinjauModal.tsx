'use client';
import { Button, Group, Image, Modal, Stack, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import type { SampahItem } from '@/lib/sampah/sampah-item';
import { isGambarSampah } from '../_lib/sampah-view.logic';

type Props = { item: SampahItem | null; onClose: () => void };

/** Modal pratinjau item Sampah: gambar ditampilkan; dokumen/berkas lain dibuka di tab baru. */
export function SampahPratinjauModal({ item, onClose }: Props) {
  const url = item?.pratinjauUrl ?? null;
  return (
    <Modal opened={item !== null && url !== null} onClose={onClose} title={item?.judul} centered size="lg">
      {item && url && (
        <Stack gap="md">
          {isGambarSampah(item) ? (
            <Image src={url} alt={item.judul} fit="contain" mah="70vh" radius="sm" />
          ) : (
            <Text fz="sm" c="dimmed">
              Berkas ini tidak bisa dipratinjau di sini. Buka di tab baru untuk melihat isinya.
            </Text>
          )}
          <Group justify="flex-end">
            <Button
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              leftSection={<IconExternalLink size={16} />}
            >
              Buka di tab baru
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
