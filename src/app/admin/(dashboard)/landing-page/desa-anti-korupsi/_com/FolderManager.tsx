'use client';
import { FOLDER_MAX_PER_PROGRAM } from '@/lib/desa-anti-korupsi-folder';
import { ActionIcon, Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconFolder, IconFolderPlus } from '@tabler/icons-react';
import { useRef, useState } from 'react';
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

// Menu Mantine mengembalikan fokus ke tombol titik tiga ±10ms setelah tertutup (useFocusReturn);
// fokus ke input nama ditunda melewati itu supaya "Ganti nama" tidak langsung kehilangan fokus.
const RENAME_FOCUS_DELAY_MS = 50;

type Props = { value: IsiDraft; onChange: (next: IsiDraft) => void };

/** Kelola folder program: tambah, naik/turun urutan, dan menu aksi (ganti nama, duplikat, salin isi, hapus). */
export function FolderManager({ value, onChange }: Props) {
  const { folders } = value;
  const penuh = folders.length >= FOLDER_MAX_PER_PROGRAM;
  const inputs = useRef(new Map<string, HTMLInputElement>());
  // Folder asal "Salin isi ke…" disimpan terpisah dari status buka agar judul modal tidak berubah saat menutup.
  const [copyFrom, setCopyFrom] = useState<string | null>(null);
  const [copyOpened, setCopyOpened] = useState(false);

  const apply = (outcome: FolderOutcome) => {
    if (outcome.isi !== value) onChange(outcome.isi);
    showNotice(outcome);
  };
  const focusNama = (key: string) =>
    window.setTimeout(() => {
      const input = inputs.current.get(key);
      input?.focus();
      input?.select();
    }, RENAME_FOCUS_DELAY_MS);

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
          onClick={() => onChange(addFolder(value))}
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
            <TextInput
              ref={(el) => {
                if (el) inputs.current.set(f.key, el);
                else inputs.current.delete(f.key);
              }}
              flex={1}
              size="sm"
              aria-label={`Nama folder ${index + 1}`}
              placeholder="Nama folder"
              value={f.nama}
              onChange={(e) => onChange(renameFolder(value, f.key, e.currentTarget.value))}
              error={folderNamaError(folders, f.key)}
              rightSection={
                <Text fz="xs" c="dimmed">
                  {dokumenCount}
                </Text>
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
                onRename={() => focusNama(f.key)}
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
