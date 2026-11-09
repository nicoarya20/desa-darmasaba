'use client';
import { ActionIcon, Menu } from '@mantine/core';
import { IconArrowsSort } from '@tabler/icons-react';
import { URUT_DRAFT_OPTIONS } from '../_lib/urut-draft';

type DropdownProps = { onSelect: (optionValue: string) => void };

/** Isi dropdown "Urutkan menurut…"; dipisah dari trigger agar bisa diuji tanpa membuka menu. */
export function UrutFolderDropdown({ onSelect }: DropdownProps) {
  return (
    <Menu.Dropdown>
      <Menu.Label>Urutkan menurut…</Menu.Label>
      {URUT_DRAFT_OPTIONS.map((o) => (
        <Menu.Item key={o.value} data-urut={o.value} onClick={() => onSelect(o.value)}>
          {o.label}
        </Menu.Item>
      ))}
    </Menu.Dropdown>
  );
}

type Props = DropdownProps & { namaFolder: string; count: number };

/** Tombol "Urutkan menurut…" di header kelompok folder; nonaktif bila isi kurang dari 2 dokumen. */
export function UrutFolderMenu({ namaFolder, count, onSelect }: Props) {
  const label = `Urutkan isi ${namaFolder} menurut…`;
  return (
    <Menu position="bottom-end" withinPortal shadow="md">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" mr="xs" aria-label={label} title={label} disabled={count < 2}>
          <IconArrowsSort size={16} />
        </ActionIcon>
      </Menu.Target>
      <UrutFolderDropdown onSelect={onSelect} />
    </Menu>
  );
}
