'use client';
import { isPdfMime } from '@/lib/desa-anti-korupsi-dokumen';
import { ActionIcon, Badge, Box, Group, Paper, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowDown, IconArrowUp, IconEye, IconFile, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { draftsFromFiles, moveDokumen, type DokumenDraft } from '../_lib/dokumen-draft';
import { DokumenPreviewFrame } from './DokumenPreviewFrame';

const MAX_FILE_SIZE = 5 * 1024 ** 2;
const ACCEPT = { 'application/*': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'] };

/** URL pratinjau draft: object URL untuk berkas lokal (dicabut saat berganti), link server untuk yang tersimpan. */
function usePreviewUrl(draft: DokumenDraft | null): string | null {
  const file = draft?.file;
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl],
  );
  return objectUrl ?? draft?.link ?? null;
}

type Props = {
  value: DokumenDraft[];
  onChange: (next: DokumenDraft[]) => void;
};

/** Editor "folder" dokumen program: unggah banyak berkas, ubah judul, hapus, dan atur urutan. */
export function DokumenFolderEditor({ value, onChange }: Props) {
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const previewDraft = value.find((d) => d.key === previewKey) ?? null;
  const previewUrl = usePreviewUrl(previewDraft);

  const setJudul = (key: string, judul: string) =>
    onChange(value.map((d) => (d.key === key ? { ...d, judul } : d)));

  const remove = (key: string) => {
    if (previewKey === key) setPreviewKey(null);
    onChange(value.filter((d) => d.key !== key));
  };

  return (
    <Stack gap="sm">
      <Text fw="bold" fz="sm">
        Dokumen ({value.length})
      </Text>
      <Dropzone
        multiple
        onDrop={(files) => onChange([...value, ...draftsFromFiles(files)])}
        onReject={() => toast.error('File tidak valid, gunakan format dokumen maksimal 5MB')}
        maxSize={MAX_FILE_SIZE}
        accept={ACCEPT}
        radius="md"
      >
        <Group justify="center" gap="xl" mih={140} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload size={48} color="var(--mantine-color-blue-6)" stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={48} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
          </Dropzone.Idle>
          <div>
            <Text size="lg" inline>
              Seret dokumen ke sini atau klik untuk memilih (bisa lebih dari satu)
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Maksimal 5MB per file (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
            </Text>
          </div>
        </Group>
      </Dropzone>

      {value.length === 0 && (
        <Text fz="sm" c="dimmed">
          Folder masih kosong
        </Text>
      )}

      {value.map((d, index) => (
        <Paper key={d.key} withBorder radius="md" p="sm">
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <Badge variant="light" mt={8}>
              {index + 1}
            </Badge>
            <Box flex={1} miw={0}>
              <TextInput
                aria-label={`Judul dokumen ${index + 1}`}
                placeholder="Judul dokumen"
                value={d.judul}
                onChange={(e) => setJudul(d.key, e.currentTarget.value)}
                error={d.judul.trim() === '' ? 'Judul wajib diisi' : undefined}
              />
              <Group gap={6} mt={4}>
                <Text fz="xs" c="dimmed" truncate maw={260}>
                  {d.realName ?? '-'}
                </Text>
                {!d.fileId && (
                  <Badge size="xs" color="orange" variant="light">
                    Belum diunggah
                  </Badge>
                )}
              </Group>
            </Box>
            <Group gap={4} wrap="nowrap" mt={4}>
              <Tooltip label={isPdfMime(d.mimeType) ? 'Pratinjau' : 'Pratinjau hanya untuk PDF'}>
                <ActionIcon
                  variant={previewKey === d.key ? 'filled' : 'light'}
                  aria-label="Pratinjau dokumen"
                  disabled={!isPdfMime(d.mimeType)}
                  onClick={() => setPreviewKey(previewKey === d.key ? null : d.key)}
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
              <ActionIcon
                variant="light"
                aria-label="Naikkan urutan"
                disabled={index === 0}
                onClick={() => onChange(moveDokumen(value, index, -1))}
              >
                <IconArrowUp size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                aria-label="Turunkan urutan"
                disabled={index === value.length - 1}
                onClick={() => onChange(moveDokumen(value, index, 1))}
              >
                <IconArrowDown size={16} />
              </ActionIcon>
              <ActionIcon variant="light" color="red" aria-label="Hapus dokumen" onClick={() => remove(d.key)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>
      ))}

      {previewDraft && previewUrl && (
        <DokumenPreviewFrame src={previewUrl} title={previewDraft.judul || previewDraft.realName || 'Dokumen'} />
      )}
    </Stack>
  );
}
