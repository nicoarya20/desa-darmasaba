'use client';
import { isPdfMime } from '@/lib/desa-anti-korupsi-dokumen';
import { ActionIcon, Badge, Box, Checkbox, Group, Paper, Select, Text, TextInput, Tooltip } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconEye, IconTrash } from '@tabler/icons-react';
import type { DokumenDraft } from '../_lib/dokumen-draft';

type Props = {
  draft: DokumenDraft;
  index: number;
  total: number;
  folderOptions: { value: string; label: string }[];
  folderValue: string;
  selected: boolean;
  /** Dipanggil saat checkbox diklik; `shiftKey` true = Shift+klik (pilih rentang). */
  onToggleSelect: (shiftKey: boolean) => void;
  onJudul: (judul: string) => void;
  onFolder: (value: string) => void;
  onMove: (direction: -1 | 1) => void;
  onPreview: () => void;
  onRemove: () => void;
};

/** Satu baris ringkas dokumen di editor: pilih, judul, pindah folder, pratinjau, urutan, hapus. */
export function DokumenDraftRow({ draft, index, total, folderOptions, folderValue, selected, ...on }: Props) {
  const pdf = isPdfMime(draft.mimeType);
  return (
    <Paper
      withBorder
      radius="md"
      p="xs"
      data-draft-key={draft.key}
      data-selected={selected || undefined}
      bg={selected ? 'var(--mantine-primary-color-light)' : undefined}
    >
      <Group gap="xs" wrap="wrap" align="flex-start">
        {/* onClick (bukan onChange) agar shiftKey terbaca; Checkbox controlled sehingga tidak ada dobel-trigger. */}
        <Checkbox
          mt={7}
          size="sm"
          aria-label={`Pilih ${draft.judul.trim() || `dokumen ${index + 1}`}`}
          checked={selected}
          onClick={(e) => on.onToggleSelect(e.shiftKey)}
        />
        <Badge variant="light" mt={6}>
          {index + 1}
        </Badge>
        <Box flex={1} miw={180}>
          <TextInput
            size="xs"
            aria-label={`Judul dokumen ${index + 1}`}
            placeholder="Judul dokumen"
            value={draft.judul}
            onChange={(e) => on.onJudul(e.currentTarget.value)}
            error={draft.judul.trim() === '' ? 'Judul wajib diisi' : undefined}
          />
          <Group gap={6} mt={2} wrap="nowrap">
            <Text fz="xs" c="dimmed" truncate maw={220}>
              {draft.realName ?? '-'}
            </Text>
            {!draft.fileId && (
              <Badge size="xs" color="orange" variant="light">
                Belum diunggah
              </Badge>
            )}
          </Group>
        </Box>
        <Select
          size="xs"
          w={150}
          aria-label="Pindah ke folder"
          data={folderOptions}
          value={folderValue}
          onChange={(v) => v && on.onFolder(v)}
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
        />
        <Group gap={4} wrap="nowrap">
          <Tooltip label={pdf ? 'Pratinjau' : 'Pratinjau hanya untuk PDF'}>
            <ActionIcon variant="light" size="md" aria-label="Pratinjau dokumen" disabled={!pdf} onClick={on.onPreview}>
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon variant="light" size="md" aria-label="Naikkan urutan" disabled={index === 0} onClick={() => on.onMove(-1)}>
            <IconArrowUp size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            size="md"
            aria-label="Turunkan urutan"
            disabled={index === total - 1}
            onClick={() => on.onMove(1)}
          >
            <IconArrowDown size={14} />
          </ActionIcon>
          <ActionIcon variant="light" size="md" color="red" aria-label="Hapus dokumen" onClick={on.onRemove}>
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}
