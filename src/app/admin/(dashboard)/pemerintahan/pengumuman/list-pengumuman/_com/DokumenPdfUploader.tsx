'use client';
import colors from '@/con/colors';
import { ActionIcon, Badge, Box, Button, Group, Modal, Paper, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconEye, IconFileTypePdf, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { DokumenPreviewFrame } from '@/app/admin/(dashboard)/landing-page/desa-anti-korupsi/_com/DokumenPreviewFrame';
import { DOKUMEN_PDF_ACCEPT, DOKUMEN_PDF_MAX_BYTES, formatUkuran, type DokumenItem } from '../_lib/lampiran.logic';

const BATAS_UKURAN = formatUkuran(DOKUMEN_PDF_MAX_BYTES);

type Props = { items: DokumenItem[]; max: number; onAdd: (files: File[]) => void; onRemove: (key: string) => void };

/** Lampiran dokumen PDF pengumuman (opsional, banyak berkas) dengan pratinjau iframe; diunggah saat Simpan. */
export function DokumenPdfUploader({ items, max, onAdd, onRemove }: Props) {
  const [pratinjau, setPratinjau] = useState<DokumenItem | null>(null);
  const penuh = items.length >= max;
  return (
    <Box>
      <Group justify="space-between" mb={6}>
        <Text fw="bold" fz="sm">
          Dokumen PDF (opsional)
        </Text>
        <Text fz="xs" c="dimmed">
          {items.length}/{max} dokumen
        </Text>
      </Group>
      <Dropzone
        onDrop={onAdd}
        onReject={() => toast.error(`File tidak valid, gunakan PDF maksimal ${BATAS_UKURAN}`)}
        maxSize={DOKUMEN_PDF_MAX_BYTES}
        accept={DOKUMEN_PDF_ACCEPT}
        multiple
        disabled={penuh}
        radius="md"
        p="md"
      >
        <Group justify="center" gap="md" mih={80}>
          <Dropzone.Accept>
            <IconUpload size={32} color={colors['blue-button']} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={32} color="red" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFileTypePdf size={32} color="#868e96" stroke={1.5} />
          </Dropzone.Idle>
          <Stack gap={4} align="center">
            <Text size="sm" fw={500}>
              {penuh ? `Batas ${max} dokumen tercapai` : 'Seret PDF ke sini atau klik untuk memilih (bisa lebih dari satu)'}
            </Text>
            <Text size="xs" c="dimmed">
              Hanya PDF, maksimal {BATAS_UKURAN} per berkas
            </Text>
          </Stack>
        </Group>
      </Dropzone>

      {items.length > 0 && (
        <Stack gap="xs" mt="sm">
          {items.map((item, index) => (
            <Paper key={item.key} withBorder radius="md" p="xs" data-dokumen-item>
              <Group justify="space-between" wrap="nowrap" gap="xs">
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                  <IconFileTypePdf size={20} color={colors['blue-button']} style={{ flexShrink: 0 }} />
                  <Box style={{ minWidth: 0 }}>
                    <Text fz="sm" truncate="end">
                      {item.nama}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      {formatUkuran(item.size)}
                    </Text>
                  </Box>
                  {!item.id && (
                    <Badge size="xs" variant="light">
                      Baru
                    </Badge>
                  )}
                </Group>
                <Group gap={4} wrap="nowrap">
                  <Button
                    size="compact-xs"
                    variant="light"
                    leftSection={<IconEye size={14} />}
                    onClick={() => setPratinjau(item)}
                  >
                    Pratinjau
                  </Button>
                  <ActionIcon
                    variant="light"
                    color="red"
                    aria-label={`Hapus dokumen ${index + 1}`}
                    onClick={() => onRemove(item.key)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      <Modal opened={pratinjau !== null} onClose={() => setPratinjau(null)} size="xl" title={pratinjau?.nama} centered>
        {pratinjau && <DokumenPreviewFrame src={pratinjau.preview} title={pratinjau.nama} />}
      </Modal>
    </Box>
  );
}
