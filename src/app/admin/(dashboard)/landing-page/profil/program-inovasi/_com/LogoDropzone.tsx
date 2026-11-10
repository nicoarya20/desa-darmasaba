'use client';
import colors from '@/con/colors';
import { ActionIcon, Box, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { GAMBAR_ACCEPT, GAMBAR_MAX_BYTES } from '../_lib/dokumentasi.logic';

type Props = {
  preview: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
};

/** Dropzone logo/cover tunggal Program Inovasi (opsional) dengan preview + tombol hapus. */
export function LogoDropzone({ preview, onSelect, onRemove }: Props) {
  return (
    <Box>
      <Text fw="bold" fz="sm" mb={6}>
        Logo/Gambar Program (opsional)
      </Text>
      <Dropzone
        onDrop={(files) => {
          if (files[0]) onSelect(files[0]);
        }}
        onReject={() => toast.error('File tidak valid, gunakan format gambar')}
        maxSize={GAMBAR_MAX_BYTES}
        accept={GAMBAR_ACCEPT}
        multiple={false}
        radius="md"
        p="xl"
      >
        <Group justify="center" gap="xl" mih={180}>
          <Dropzone.Accept>
            <IconUpload size={48} color={colors['blue-button']} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={48} color="red" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={48} color="#868e96" stroke={1.5} />
          </Dropzone.Idle>
          <Stack gap="xs" align="center">
            <Text size="md" fw={500}>
              Seret gambar atau klik untuk memilih file
            </Text>
            <Text size="sm" c="dimmed">
              Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp
            </Text>
          </Stack>
        </Group>
      </Dropzone>

      {preview && (
        <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
          <Image
            src={preview}
            alt="Preview logo program"
            radius="md"
            style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
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
            aria-label="Hapus logo program"
            onClick={onRemove}
            style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
          >
            <IconX size={14} />
          </ActionIcon>
        </Box>
      )}
    </Box>
  );
}
