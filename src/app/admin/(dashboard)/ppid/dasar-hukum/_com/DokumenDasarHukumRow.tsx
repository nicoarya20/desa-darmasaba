'use client';
import { ActionIcon, Button, Group, TextInput } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconCheck, IconExternalLink, IconTrash } from '@tabler/icons-react';
import { JUDUL_DOKUMEN_MAX } from '@/app/api/[[...slugs]]/_lib/ppid/dasar_hukum/dokumen/dokumen.rules';
import type { DokumenDasarHukum } from '../../../_state/ppid/dasar_hukum/dokumenDasarHukum';
import { DOKUMEN_ADMIN_TEXT as T } from './dokumen-dasar-hukum.text';

type Props = {
  item: DokumenDasarHukum;
  /** Judul yang sedang diedit; undefined = belum diubah. */
  draft: string | undefined;
  isFirst: boolean;
  isLast: boolean;
  /** Ada operasi lain berjalan: semua tombol aksi dimatikan. */
  disabled: boolean;
  onDraft: (judul: string) => void;
  onSaveJudul: () => void;
  onMove: (delta: -1 | 1) => void;
  onDelete: () => void;
};

/** Satu baris dokumen: judul bisa diedit, tautan "Lihat", tombol naik/turun, dan hapus. */
export function DokumenDasarHukumRow({ item, draft, isFirst, isLast, disabled, onDraft, onSaveJudul, onMove, onDelete }: Props) {
  const changed = draft !== undefined && draft.trim() !== item.judul;
  return (
    <Group gap="xs" wrap="nowrap" align="center">
      <TextInput
        flex={1}
        size="sm"
        aria-label={`Judul ${item.file.realName}`}
        value={draft ?? item.judul}
        maxLength={JUDUL_DOKUMEN_MAX}
        disabled={disabled}
        onChange={(event) => onDraft(event.currentTarget.value)}
      />
      {changed && (
        <ActionIcon variant="light" color="green" aria-label={T.simpanJudul} disabled={disabled} onClick={onSaveJudul}>
          <IconCheck size={18} />
        </ActionIcon>
      )}
      <Button
        component="a"
        href={item.file.link}
        target="_blank"
        rel="noopener noreferrer"
        variant="subtle"
        size="compact-sm"
        leftSection={<IconExternalLink size={16} />}
      >
        {T.lihat}
      </Button>
      <ActionIcon variant="subtle" aria-label={T.naik} disabled={disabled || isFirst} onClick={() => onMove(-1)}>
        <IconArrowUp size={18} />
      </ActionIcon>
      <ActionIcon variant="subtle" aria-label={T.turun} disabled={disabled || isLast} onClick={() => onMove(1)}>
        <IconArrowDown size={18} />
      </ActionIcon>
      <ActionIcon variant="subtle" color="red" aria-label={T.hapus} disabled={disabled} onClick={onDelete}>
        <IconTrash size={18} />
      </ActionIcon>
    </Group>
  );
}
