'use client';
import colors from '@/con/colors';
import { ActionIcon, Box, Group, Image, SimpleGrid, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPhotoPlus, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { GAMBAR_ACCEPT, GAMBAR_MAX_BYTES, type DokumentasiItem } from '../_lib/dokumentasi.logic';

type Props = {
  items: DokumentasiItem[];
  max: number;
  onAdd: (files: File[]) => void;
  onRemove: (key: string) => void;
};

/** Uploader multi-gambar "Dokumentasi Program": dropzone, grid thumbnail, hapus per gambar. */
export function DokumentasiUploader({ items, max, onAdd, onRemove }: Props) {
  const penuh = items.length >= max;
  return (
    <Box>
      <Group justify="space-between" mb={6}>
        <Text fw="bold" fz="sm">
          Dokumentasi Program
        </Text>
        <Text fz="xs" c="dimmed" data-testid="dokumentasi-jumlah">
          {items.length}/{max} gambar
        </Text>
      </Group>
      <Dropzone
        onDrop={onAdd}
        onReject={() => toast.error('File tidak valid, gunakan format gambar maksimal 5MB')}
        maxSize={GAMBAR_MAX_BYTES}
        accept={GAMBAR_ACCEPT}
        multiple
        disabled={penuh}
        radius="md"
        p="md"
      >
        <Group justify="center" gap="md" mih={110}>
          <Dropzone.Accept>
            <IconUpload size={36} color={colors['blue-button']} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={36} color="red" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhotoPlus size={36} color="#868e96" stroke={1.5} />
          </Dropzone.Idle>
          <Stack gap={4} align="center">
            <Text size="sm" fw={500}>
              {penuh ? `Batas ${max} gambar tercapai` : 'Seret beberapa foto kegiatan atau klik untuk memilih'}
            </Text>
            <Text size="xs" c="dimmed">
              Maksimal 5MB per gambar, format .png, .jpg, .jpeg, webp
            </Text>
          </Stack>
        </Group>
      </Dropzone>

      {items.length > 0 && (
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm" mt="sm">
          {items.map((item, index) => (
            <Box key={item.key} pos="relative" data-dokumentasi-thumb>
              <Image
                src={item.preview}
                alt={`Dokumentasi ${index + 1}`}
                h={110}
                fit="cover"
                radius="md"
                style={{ border: '1px solid #ddd' }}
                loading="lazy"
              />
              <ActionIcon
                variant="filled"
                color="red"
                radius="xl"
                size="sm"
                pos="absolute"
                top={5}
                right={5}
                aria-label={`Hapus dokumentasi ${index + 1}`}
                onClick={() => onRemove(item.key)}
              >
                <IconX size={14} />
              </ActionIcon>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
