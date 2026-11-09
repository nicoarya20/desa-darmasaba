'use client';
import { isPdfMime } from '@/lib/desa-anti-korupsi-dokumen';
import { ActionIcon, Badge, Box, Checkbox, Group, Paper, Select, Text, Tooltip } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconEye, IconTrash } from '@tabler/icons-react';
import type { DokumenDraft } from '../_lib/dokumen-draft';
import { draftInfo } from '../_lib/draft-info';
import { judulDokumenError } from '../_lib/inline-edit';
import { InlineEditText } from './InlineEditText';

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
  /** Nonaktifkan naik/turun urutan (mis. selama tampilan disaring pencarian). */
  moveLocked?: boolean;
};

/** Satu baris ringkas dokumen di editor: pilih, judul, info ukuran/tanggal, pindah folder, pratinjau, urutan, hapus. */
export function DokumenDraftRow({ draft, index, total, folderOptions, folderValue, selected, moveLocked = false, ...on }: Props) {
  const pdf = isPdfMime(draft.mimeType);
  const info = draftInfo(draft);
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
          <InlineEditText
            size="sm"
            label={`Judul dokumen ${index + 1}`}
            placeholder="Judul dokumen"
            value={draft.judul}
            validate={judulDokumenError}
            error={judulDokumenError(draft.judul)}
            onSave={on.onJudul}
          />
          <Group gap={6} mt={2} wrap="wrap" data-draft-info>
            <Text fz="xs" c="dimmed" truncate maw={220}>
              {draft.realName ?? '-'}
            </Text>
            <Text fz="xs" c="dimmed" data-info="ukuran" style={{ whiteSpace: 'nowrap' }}>
              {info.ukuran}
            </Text>
            {info.baru ? (
              <Badge size="xs" color="teal" variant="light" data-info="tanggal">
                {info.tanggal}
              </Badge>
            ) : (
              <Text fz="xs" c="dimmed" data-info="tanggal" style={{ whiteSpace: 'nowrap' }}>
                {info.tanggal}
              </Text>
            )}
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
          <ActionIcon
            variant="light"
            size="md"
            aria-label="Naikkan urutan"
            disabled={moveLocked || index === 0}
            onClick={() => on.onMove(-1)}
          >
            <IconArrowUp size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            size="md"
            aria-label="Turunkan urutan"
            disabled={moveLocked || index === total - 1}
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
