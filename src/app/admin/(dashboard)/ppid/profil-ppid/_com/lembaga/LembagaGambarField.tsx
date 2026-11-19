'use client';
import { ActionIcon, Box, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';

/** Batas ukuran gambar alur yang boleh diunggah (MB), sama dengan foto Profil PPID. */
export const GAMBAR_ALUR_MAX_MB = 5;

type Props = {
  /** Alamat gambar yang ditampilkan: pilihan baru (object URL) atau gambar tersimpan; null bila tidak ada. */
  previewUrl: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
};

/** Field unggah satu gambar alur (Dropzone + pratinjau + tombol lepas); unggahan ke server dilakukan pemanggil. */
export function LembagaGambarField({ previewUrl, onPick, onRemove }: Props) {
  return (
    <Stack gap={6}>
      <Text fw="bold" fz="sm">Gambar Alur</Text>
      <Text fz="xs" c="dimmed">Opsional. Bagan alur layanan informasi publik.</Text>
      <Dropzone
        onDrop={(files) => files[0] && onPick(files[0])}
        onReject={() => toast.error(`Berkas harus gambar dengan ukuran maksimal ${GAMBAR_ALUR_MAX_MB} MB`)}
        accept={IMAGE_MIME_TYPE}
        maxSize={GAMBAR_ALUR_MAX_MB * 1024 ** 2}
        multiple={false}
        radius="md"
        p="lg"
      >
        <Group justify="center" gap="md" mih={90} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept><IconUpload size={36} color="var(--mantine-color-blue-6)" stroke={1.5} /></Dropzone.Accept>
          <Dropzone.Reject><IconX size={36} color="var(--mantine-color-red-6)" stroke={1.5} /></Dropzone.Reject>
          <Dropzone.Idle><IconPhoto size={36} color="#868e96" stroke={1.5} /></Dropzone.Idle>
          <Text size="sm" ta="center">Seret gambar atau klik untuk memilih</Text>
        </Group>
      </Dropzone>
      {previewUrl && (
        <Box pos="relative" ta="center">
          <Image
            src={previewUrl}
            alt="Pratinjau gambar alur"
            radius="md"
            mah={240}
            fit="contain"
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
            aria-label="Lepas gambar alur"
            onClick={onRemove}
          >
            <IconX size={14} />
          </ActionIcon>
        </Box>
      )}
    </Stack>
  );
}
