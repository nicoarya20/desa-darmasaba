'use client'
import { Group, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';

/** Batas ukuran satu gambar BUMDes yang diterima dropzone. */
export const MAX_IMAGE_BYTES = 5 * 1024 ** 2;

type Props = {
  onDrop: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** Teks utama di dalam dropzone. */
  title?: string;
  mt?: string | number;
};

/** Dropzone gambar BUMDes (JPG/PNG/WebP, maks 5MB per file); dipakai field satu gambar dan galeri. */
export default function BumdesDropzone({
  onDrop,
  multiple = false,
  disabled = false,
  loading = false,
  title = 'Seret gambar ke sini atau klik untuk memilih file',
  mt,
}: Props) {
  return (
    <Dropzone
      onDrop={onDrop}
      maxSize={MAX_IMAGE_BYTES}
      multiple={multiple}
      disabled={disabled}
      loading={loading}
      accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
      mt={mt}
      style={{ border: '2px dashed #ced4da', borderRadius: 8 }}
    >
      <Group justify="center" gap="md" mih={110} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept><IconUpload size={40} color="var(--mantine-color-blue-6)" stroke={1.5} /></Dropzone.Accept>
        <Dropzone.Reject><IconX size={40} color="var(--mantine-color-red-6)" stroke={1.5} /></Dropzone.Reject>
        <Dropzone.Idle><IconPhoto size={40} color="var(--mantine-color-dimmed)" stroke={1.5} /></Dropzone.Idle>
        <div>
          <Text size="sm" inline>{title}</Text>
          <Text size="xs" c="dimmed" inline mt={7}>JPG, PNG, WebP. Maksimal 5MB per file</Text>
        </div>
      </Group>
    </Dropzone>
  );
}
