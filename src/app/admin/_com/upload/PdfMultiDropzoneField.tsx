'use client'
import { ActionIcon, Badge, Group, Stack, Text, TextInput } from '@mantine/core';
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { IconFile, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { PDF_MAX_SIZE_MB } from './pdf-upload';

/** Satu PDF yang menunggu diunggah, dengan judul yang boleh diedit dan hasil unggah terakhirnya. */
export type PdfMultiItem = {
  key: string;
  file: File;
  judul: string;
  /** `proses` = sedang diunggah, `berhasil`/`gagal` = hasil percobaan terakhir. */
  status?: 'proses' | 'berhasil' | 'gagal';
  /** Alasan gagal (ditampilkan di bawah judul). */
  pesan?: string;
  /** Id FileStorage bila berkas sudah terunggah tetapi langkah berikutnya gagal (percobaan ulang tidak mengunggah lagi). */
  fileId?: string;
};

type Props = {
  label: string;
  description?: string;
  items: readonly PdfMultiItem[];
  onChange: (items: PdfMultiItem[]) => void;
  /** Batas panjang judul (karakter); judul awal dari nama berkas dipangkas ke batas ini. */
  maxJudulLength?: number;
  /** Matikan dropzone dan kolom judul selama unggahan berjalan. */
  disabled?: boolean;
};

const STATUS_LABEL = { proses: 'Mengunggah…', berhasil: 'Berhasil', gagal: 'Gagal' } as const;
const STATUS_COLOR = { proses: 'blue', berhasil: 'green', gagal: 'red' } as const;

let keySeq = 0;

/** Judul awal dari nama berkas: ekstensi `.pdf` dibuang, selebihnya apa adanya (dipangkas ke `max`). */
export function pdfTitleFromFileName(fileName: string, max?: number): string {
  const title = fileName.replace(/\.pdf$/i, '').trim();
  return max ? title.slice(0, max) : title;
}

/** Field unggah banyak PDF sekaligus (Dropzone + daftar berjudul yang bisa diedit); unggahan ke server dilakukan pemanggil. */
export default function PdfMultiDropzoneField({ label, description, items, onChange, maxJudulLength, disabled }: Props) {
  const addFiles = (files: File[]) => {
    const added = files.map((file) => ({
      key: `pdf-${Date.now()}-${keySeq++}`,
      file,
      judul: pdfTitleFromFileName(file.name, maxJudulLength),
    }));
    onChange([...items, ...added]);
  };
  const patch = (key: string, change: Partial<PdfMultiItem>) =>
    onChange(items.map((item) => (item.key === key ? { ...item, ...change } : item)));

  return (
    <Stack gap={6}>
      <Text fw="bold" fz="sm">{label}</Text>
      {description && <Text fz="xs" c="dimmed">{description}</Text>}
      <Dropzone
        onDrop={addFiles}
        onReject={(rejections) =>
          toast.error(`Berkas harus PDF dengan ukuran maksimal ${PDF_MAX_SIZE_MB} MB: ${rejections.map((r) => r.file.name).join(', ')}`)
        }
        accept={PDF_MIME_TYPE}
        maxSize={PDF_MAX_SIZE_MB * 1024 ** 2}
        multiple
        disabled={disabled}
        radius="md"
        p="lg"
      >
        <Group justify="center" gap="md" mih={90}>
          <Dropzone.Accept><IconUpload size={36} color="var(--mantine-color-blue-6)" stroke={1.5} /></Dropzone.Accept>
          <Dropzone.Reject><IconX size={36} color="var(--mantine-color-red-6)" stroke={1.5} /></Dropzone.Reject>
          <Dropzone.Idle><IconFile size={36} color="#868e96" stroke={1.5} /></Dropzone.Idle>
          <Text size="sm" ta="center">Seret satu atau beberapa PDF, atau klik untuk memilih</Text>
        </Group>
      </Dropzone>
      {items.map((item) => (
        <Stack key={item.key} gap={2}>
          <Group gap="xs" align="flex-end" wrap="nowrap">
            <TextInput
              flex={1}
              size="sm"
              label={item.file.name}
              aria-label={`Judul untuk ${item.file.name}`}
              value={item.judul}
              maxLength={maxJudulLength}
              disabled={disabled}
              onChange={(event) => patch(item.key, { judul: event.currentTarget.value, status: undefined, pesan: undefined })}
            />
            {item.status && <Badge color={STATUS_COLOR[item.status]} variant="light">{STATUS_LABEL[item.status]}</Badge>}
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label={`Batalkan ${item.file.name}`}
              disabled={disabled}
              onClick={() => onChange(items.filter((other) => other.key !== item.key))}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
          {item.pesan && <Text fz="xs" c="red">{item.pesan}</Text>}
        </Stack>
      ))}
    </Stack>
  );
}
