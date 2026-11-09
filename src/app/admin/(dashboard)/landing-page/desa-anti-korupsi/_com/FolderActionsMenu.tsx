'use client';
import { FOLDER_MAX_PER_PROGRAM } from '@/lib/desa-anti-korupsi-folder';
import { ActionIcon, Menu, Text, Tooltip } from '@mantine/core';
import { IconCopy, IconDotsVertical, IconFolderShare, IconPencil, IconTrash } from '@tabler/icons-react';

type Props = {
  namaFolder: string;
  onRename: () => void;
  onDuplicate: () => void;
  onCopyContents: () => void;
  onDelete: () => void;
  disableDuplicate?: boolean;
};

/** Isi dropdown aksi folder; dipisah dari trigger agar bisa diuji tanpa membuka menu. */
export function FolderActionsDropdown({
  onRename,
  onDuplicate,
  onCopyContents,
  onDelete,
  disableDuplicate = false,
}: Omit<Props, 'namaFolder'>) {
  return (
    <Menu.Dropdown>
      <Menu.Item leftSection={<IconPencil size={14} />} onClick={onRename}>
        Ganti nama
      </Menu.Item>
      <Tooltip label={`Batas ${FOLDER_MAX_PER_PROGRAM} folder`} disabled={!disableDuplicate} position="left" withArrow>
        {/* Elemen disabled tidak memicu hover; tooltip dipasang di pembungkus. */}
        <div>
          <Menu.Item leftSection={<IconCopy size={14} />} disabled={disableDuplicate} onClick={onDuplicate}>
            Duplikat folder
          </Menu.Item>
        </div>
      </Tooltip>
      <Menu.Item leftSection={<IconFolderShare size={14} />} onClick={onCopyContents}>
        Salin isi ke…
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
        Hapus folder
        <Text component="span" display="block" fz="xs" c="dimmed">
          dokumen pindah ke Umum
        </Text>
      </Menu.Item>
    </Menu.Dropdown>
  );
}

/** Menu titik tiga per folder: ganti nama, duplikat, salin isi ke folder lain, hapus. */
export function FolderActionsMenu({ namaFolder, ...actions }: Props) {
  return (
    <Menu position="bottom-end" withinPortal shadow="md">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label={`Aksi folder ${namaFolder}`}>
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <FolderActionsDropdown {...actions} />
    </Menu>
  );
}
