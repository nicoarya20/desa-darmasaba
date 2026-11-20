'use client';
import { ActionIcon, Box, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { IMAGE_MAX_SIZE_MB } from './image-upload';

type Props = {
  /** Judul field, mis. "Foto". */
  label: string;
  /** Keterangan kecil di bawah label, mis. "Opsional". */
  description?: string;
  /** Alamat gambar yang ditampilkan: pilihan baru (object URL) atau gambar tersimpan; null bila tidak ada. */
  previewUrl: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
};

/** Field unggah satu gambar (Dropzone + pratinjau + tombol lepas); unggahan ke server dilakukan pemanggil lewat uploadImageFile. */
export default function ImageDropzoneField({ label, description, previewUrl, onPick, onRemove }: Props) {
  return (
    <Stack gap={6}>
      <Text fw="bold" fz="sm">{label}</Text>
      {description && <Text fz="xs" c="dimmed">{description}</Text>}
      <Dropzone
        onDrop={(files) => files[0] && onPick(files[0])}
        onReject={() => toast.error(`Berkas harus gambar dengan ukuran maksimal ${IMAGE_MAX_SIZE_MB} MB`)}
        accept={IMAGE_MIME_TYPE}
        maxSize={IMAGE_MAX_SIZE_MB * 1024 ** 2}
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
        <Box pos="relative" w="fit-content" maw="100%">
          <Image src={previewUrl} alt={`Pratinjau ${label.toLowerCase()}`} radius="md" mah={240} fit="contain" loading="lazy" />
          <ActionIcon
            variant="filled"
            color="red"
            radius="xl"
            size="sm"
            pos="absolute"
            top={5}
            right={5}
            aria-label={`Lepas ${label.toLowerCase()}`}
            onClick={onRemove}
          >
            <IconX size={14} />
          </ActionIcon>
        </Box>
      )}
    </Stack>
  );
}
