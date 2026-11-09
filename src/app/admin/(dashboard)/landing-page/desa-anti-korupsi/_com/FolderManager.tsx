'use client';
import { FOLDER_MAX_PER_PROGRAM } from '@/lib/desa-anti-korupsi-folder';
import { ActionIcon, Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconFolder, IconFolderPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { copyFolderContentsAction, duplicateFolderAction, folderLabel, type FolderOutcome } from '../_lib/dokumen-bulk-actions';
import {
  addFolder,
  folderNamaError,
  groupDrafts,
  moveFolder,
  removeFolder,
  renameFolder,
  type IsiDraft,
} from '../_lib/folder-draft';
import { showNotice } from './DokumenBulkActions';
import { FolderActionsMenu } from './FolderActionsMenu';
import { FolderPickerModal, folderPickerOptionsFromGroups } from './FolderPickerModal';
import { InlineEditText } from './InlineEditText';

// Menu Mantine mengembalikan fokus ke tombol titik tiga ±10ms setelah tertutup (useFocusReturn);
// mode input nama dibuka setelah itu supaya "Ganti nama" tidak langsung blur (= commit & tertutup).
const RENAME_FOCUS_DELAY_MS = 50;

type Props = { value: IsiDraft; onChange: (next: IsiDraft) => void };

/** Kelola folder program: tambah, ganti nama inline, naik/turun urutan, dan menu aksi (duplikat, salin isi, hapus). */
export function FolderManager({ value, onChange }: Props) {
  const { folders } = value;
  const penuh = folders.length >= FOLDER_MAX_PER_PROGRAM;
  // Folder yang sedang diganti namanya (mode input InlineEditText).
  const [renaming, setRenaming] = useState<string | null>(null);
  // Folder asal "Salin isi ke…" disimpan terpisah dari status buka agar judul modal tidak berubah saat menutup.
  const [copyFrom, setCopyFrom] = useState<string | null>(null);
  const [copyOpened, setCopyOpened] = useState(false);

  const apply = (outcome: FolderOutcome) => {
    if (outcome.isi !== value) onChange(outcome.isi);
    showNotice(outcome);
  };
  const startRename = (key: string) => window.setTimeout(() => setRenaming(key), RENAME_FOCUS_DELAY_MS);
  const tambah = () => {
    const next = addFolder(value);
    onChange(next);
    setRenaming(next.folders.at(-1)?.key ?? null); // langsung ketik nama folder baru
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text fw="bold" fz="sm">
          Folder ({folders.length}/{FOLDER_MAX_PER_PROGRAM})
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconFolderPlus size={14} />}
          disabled={penuh}
          onClick={tambah}
        >
          Tambah folder
        </Button>
      </Group>
      {folders.length === 0 && (
        <Text fz="xs" c="dimmed">
          Belum ada folder — semua dokumen masuk ke &quot;Umum&quot;.
        </Text>
      )}
      {folders.map((f, index) => {
        const dokumenCount = value.dokumen.filter((d) => d.folderKey === f.key).length;
        return (
          <Group key={f.key} gap="xs" wrap="nowrap" align="flex-start">
            <IconFolder size={18} style={{ marginTop: 8, flexShrink: 0 }} />
            <InlineEditText
              label={`Nama folder ${index + 1}`}
              placeholder="Nama folder"
              value={f.nama}
              editing={renaming === f.key}
              onEditingChange={(editing) => setRenaming(editing ? f.key : null)}
              validate={(nama) => folderNamaError(renameFolder(value, f.key, nama).folders, f.key)}
              error={folderNamaError(folders, f.key)}
              onSave={(nama) => onChange(renameFolder(value, f.key, nama))}
              extra={
                <Badge size="sm" variant="light" color="gray" aria-label={`${dokumenCount} dokumen`} style={{ flexShrink: 0 }}>
                  {dokumenCount}
                </Badge>
              }
            />
            <Group gap={4} wrap="nowrap" mt={4}>
              <ActionIcon
                variant="light"
                aria-label="Naikkan folder"
                disabled={index === 0}
                onClick={() => onChange(moveFolder(value, index, -1))}
              >
                <IconArrowUp size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                aria-label="Turunkan folder"
                disabled={index === folders.length - 1}
                onClick={() => onChange(moveFolder(value, index, 1))}
              >
                <IconArrowDown size={16} />
              </ActionIcon>
              <FolderActionsMenu
                namaFolder={f.nama.trim() || `${index + 1}`}
                disableDuplicate={penuh}
                onRename={() => startRename(f.key)}
                onDuplicate={() => apply(duplicateFolderAction(value, f.key))}
                onCopyContents={() => {
                  setCopyFrom(f.key);
                  setCopyOpened(true);
                }}
                onDelete={() => onChange(removeFolder(value, f.key))}
              />
            </Group>
          </Group>
        );
      })}
      <FolderPickerModal
        opened={copyOpened && copyFrom !== null}
        title={`Salin isi "${folderLabel(value, copyFrom)}" ke…`}
        confirmLabel="Salin"
        options={folderPickerOptionsFromGroups(groupDrafts(value))}
        disabledKeys={[copyFrom]}
        onConfirm={(toKey) => {
          if (copyFrom !== null) apply(copyFolderContentsAction(value, copyFrom, toKey));
          setCopyOpened(false);
        }}
        onClose={() => setCopyOpened(false)}
      />
    </Stack>
  );
}
