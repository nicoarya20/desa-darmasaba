'use client'
import { Button, Group, Stack, Text } from '@mantine/core';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { PDF_MAX_SIZE_MB } from './pdf-upload';

type Props = {
  /** Judul field, mis. "Berkas PDF". */
  label: string;
  /** Berkas yang baru dipilih (belum diunggah); null bila belum ada. */
  file: File | null;
  onChange: (file: File | null) => void;
  /** Berkas yang sudah tersimpan (mode edit); ditampilkan sebagai tautan. */
  currentFile?: { link: string; realName: string } | null;
  /** Keterangan kecil di bawah label, mis. "Opsional". */
  description?: string;
};

/** Field unggah satu PDF (Dropzone + tautan berkas saat ini); unggahan ke server dilakukan pemanggil lewat `uploadPdfFile`. */
export default function PdfDropzoneField({ label, file, onChange, currentFile, description }: Props) {
  return (
    <Stack gap={6}>
      <Text fw="bold" fz="sm">{label}</Text>
      {description && <Text fz="xs" c="dimmed">{description}</Text>}
      {currentFile && !file && (
        <Text fz="sm" c="dimmed">
          Berkas saat ini: <a href={currentFile.link} target="_blank" rel="noreferrer">{currentFile.realName}</a>. Pilih berkas baru untuk menggantinya.
        </Text>
      )}
      <Dropzone
        onDrop={(files) => onChange(files[0] ?? null)}
        onReject={() => toast.error(`Berkas harus PDF dengan ukuran maksimal ${PDF_MAX_SIZE_MB} MB`)}
        accept={PDF_MIME_TYPE}
        maxSize={PDF_MAX_SIZE_MB * 1024 ** 2}
        multiple={false}
        radius="md"
        p="lg"
      >
        <Group justify="center" gap="md" mih={90}>
          <Dropzone.Accept><IconUpload size={36} color="var(--mantine-color-blue-6)" stroke={1.5} /></Dropzone.Accept>
          <Dropzone.Reject><IconX size={36} color="var(--mantine-color-red-6)" stroke={1.5} /></Dropzone.Reject>
          <Dropzone.Idle><IconFile size={36} color="#868e96" stroke={1.5} /></Dropzone.Idle>
          <Text size="sm" ta="center">{file ? file.name : 'Seret PDF atau klik untuk memilih'}</Text>
        </Group>
      </Dropzone>
      {file && (
        <Button variant="subtle" color="red" size="compact-sm" w="fit-content" onClick={() => onChange(null)}>
          Batalkan pilihan berkas
        </Button>
      )}
    </Stack>
  );
}
