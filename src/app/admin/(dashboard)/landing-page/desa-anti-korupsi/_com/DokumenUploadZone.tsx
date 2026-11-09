'use client';
import { Group, Select, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';

const MAX_FILE_SIZE = 5 * 1024 ** 2;
const ACCEPT = { 'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'] };

type Props = {
  folderOptions: { value: string; label: string }[];
  target: string;
  onTargetChange: (value: string) => void;
  onDrop: (files: File[]) => void;
};

/** Pilih folder tujuan lalu unggah banyak berkas sekaligus ke folder tersebut (diunggah saat Simpan). */
export function DokumenUploadZone({ folderOptions, target, onTargetChange, onDrop }: Props) {
  return (
    <Stack gap={6}>
      <Select
        size="sm"
        label="Unggah ke folder"
        data={folderOptions}
        value={target}
        onChange={(v) => v && onTargetChange(v)}
        allowDeselect={false}
      />
      <Dropzone
        multiple
        onDrop={onDrop}
        onReject={() => toast.error('File tidak valid, gunakan format dokumen maksimal 5MB')}
        maxSize={MAX_FILE_SIZE}
        accept={ACCEPT}
        radius="md"
      >
        <Group justify="center" gap="md" mih={80} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload size={32} color="var(--mantine-color-blue-6)" stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={32} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile size={32} color="var(--mantine-color-dimmed)" stroke={1.5} />
          </Dropzone.Idle>
          <div>
            <Text size="sm" inline>
              Seret dokumen ke sini atau klik untuk memilih (bisa lebih dari satu)
            </Text>
            <Text size="xs" c="dimmed" inline mt={7} display="block">
              Maksimal 5MB per file (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
            </Text>
          </div>
        </Group>
      </Dropzone>
    </Stack>
  );
}
