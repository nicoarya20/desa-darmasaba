'use client';
import { FOLDER_MAX_PER_PROGRAM } from '@/lib/desa-anti-korupsi-folder';
import { ActionIcon, Button, Group, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconFolder, IconFolderPlus, IconTrash } from '@tabler/icons-react';
import { addFolder, folderNamaError, moveFolder, removeFolder, renameFolder, type IsiDraft } from '../_lib/folder-draft';

type Props = { value: IsiDraft; onChange: (next: IsiDraft) => void };

/** Kelola folder program: tambah, ganti nama, hapus (dokumen pindah ke "Umum"), naik/turun urutan. */
export function FolderManager({ value, onChange }: Props) {
  const { folders } = value;
  const penuh = folders.length >= FOLDER_MAX_PER_PROGRAM;

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
              <Tooltip label="Hapus folder (dokumen pindah ke Umum)">
                <ActionIcon
                  variant="light"
                  color="red"
                  aria-label="Hapus folder"
                  onClick={() => onChange(removeFolder(value, f.key))}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        );
      })}
    </Stack>
  );
}
