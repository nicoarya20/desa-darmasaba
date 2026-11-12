'use client'
import colors from '@/con/colors';
import { ActionIcon, Box, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { STRUKTUR_ADMIN_TEXT as T } from './struktur-admin.text';

/** Batas ukuran foto pegawai (5MB, sama dengan form admin lain). */
const MAX_FOTO_BYTES = 5 * 1024 ** 2;
const FOTO_ACCEPT = { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] };

type Props = {
  preview: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
};

/** Input foto opsional: dropzone saat kosong, pratinjau + tombol hapus saat terisi. */
export function FotoPegawaiInput({ preview, onPick, onRemove }: Props) {
  return (
    <Box>
      <Text fw={500} fz="sm">{T.pegawai.foto}</Text>
      <Text fz="xs" c="dimmed" mb={6}>{T.pegawai.fotoHint}</Text>
      {preview ? (
        <Box pos="relative" w="fit-content">
          <Image src={preview} alt={T.pegawai.foto} radius="md" mah={200} fit="contain" style={{ border: '1px solid #ddd' }} />
          <ActionIcon
            variant="filled"
            color="red"
            radius="xl"
            size="sm"
            pos="absolute"
            top={5}
            right={5}
            aria-label={T.pegawai.fotoRemove}
            onClick={onRemove}
          >
            <IconX size={14} />
          </ActionIcon>
        </Box>
      ) : (
        <Dropzone
          onDrop={(files) => files[0] && onPick(files[0])}
          onReject={() => toast.error(T.pegawai.fotoRejected)}
          maxSize={MAX_FOTO_BYTES}
          accept={FOTO_ACCEPT}
          multiple={false}
          radius="md"
          p="lg"
        >
          <Group justify="center" gap="lg" mih={120}>
            <Dropzone.Accept>
              <IconUpload size={40} color={colors['blue-button']} stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={40} color="red" stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto size={40} color="#868e96" stroke={1.5} />
            </Dropzone.Idle>
            <Stack gap={4} align="center">
              <Text fw={500}>{T.pegawai.fotoDrop}</Text>
            </Stack>
          </Group>
        </Dropzone>
      )}
    </Box>
  );
}
