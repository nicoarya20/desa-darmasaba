'use client';
import colors from '@/con/colors';
import { ActionIcon, Box, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { GAMBAR_ACCEPT, GAMBAR_MAX_BYTES } from '../_lib/lampiran.logic';

type Props = { preview: string | null; onSelect: (file: File) => void; onRemove: () => void };

/** Dropzone gambar/poster utama pengumuman (opsional, jadi thumbnail kartu) + preview & hapus. */
export function GambarUtamaDropzone({ preview, onSelect, onRemove }: Props) {
  return (
    <Box>
      <Text fw="bold" fz="sm" mb={6}>
        Gambar Utama (opsional)
      </Text>
      <Dropzone
        onDrop={(files) => files[0] && onSelect(files[0])}
        onReject={() => toast.error('File tidak valid, gunakan format gambar maksimal 5MB')}
        maxSize={GAMBAR_MAX_BYTES}
        accept={GAMBAR_ACCEPT}
        multiple={false}
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
            <IconPhoto size={36} color="#868e96" stroke={1.5} />
          </Dropzone.Idle>
          <Stack gap={4} align="center">
            <Text size="sm" fw={500}>
              {preview ? 'Seret gambar lain untuk mengganti' : 'Seret gambar atau klik untuk memilih'}
            </Text>
            <Text size="xs" c="dimmed">
              Maksimal 5MB, format .png, .jpg, .jpeg, webp
            </Text>
          </Stack>
        </Group>
      </Dropzone>

      {preview && (
        <Box mt="sm" pos="relative" style={{ textAlign: 'center' }} data-gambar-utama-preview>
          <Image
            src={preview}
            alt="Preview gambar utama pengumuman"
            radius="md"
            style={{ maxHeight: 220, objectFit: 'contain', border: '1px solid #ddd' }}
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
            aria-label="Hapus gambar utama"
            onClick={onRemove}
          >
            <IconX size={14} />
          </ActionIcon>
        </Box>
      )}
    </Box>
  );
}
