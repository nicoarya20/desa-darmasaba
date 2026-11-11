'use client';
import { Button, Group, Modal, Radio, Stack, Text } from '@mantine/core';
import { IconFolder, IconFolderOpen } from '@tabler/icons-react';
import { useState } from 'react';
import type { DraftGroup } from '../_lib/folder-draft';

/** Satu pilihan folder tujuan; `key` null = "Umum" (dokumen tanpa folder). */
export type FolderPickerOption = { key: string | null; nama: string; jumlah: number };

// Radio butuh value string; "Umum" (key null) diwakili sentinel yang tidak mungkin jadi id/tempKey folder.
const UMUM_VALUE = '__umum__';

/** Value Radio untuk key folder (null → sentinel "Umum"). */
export function folderPickerValue(key: string | null): string {
  return key ?? UMUM_VALUE;
}

/** Key folder dari value Radio (kebalikan `folderPickerValue`). */
export function folderPickerKey(value: string): string | null {
  return value === UMUM_VALUE ? null : value;
}

/** Opsi yang masih bisa dipilih (tidak termasuk `disabledKeys`). */
export function selectableFolderOptions(
  options: readonly FolderPickerOption[],
  disabledKeys: ReadonlyArray<string | null> = [],
): FolderPickerOption[] {
  return options.filter((o) => !disabledKeys.includes(o.key));
}

/** Opsi pemilih dari kelompok draft (`groupDrafts`), jumlah = dokumen per folder. */
export function folderPickerOptionsFromGroups(groups: readonly DraftGroup[]): FolderPickerOption[] {
  return groups.map((g) => ({ key: g.key, nama: g.nama, jumlah: g.dokumen.length }));
}

type Props = {
  opened: boolean;
  title: string;
  confirmLabel: string;
  options: FolderPickerOption[];
  disabledKeys?: ReadonlyArray<string | null>;
  onConfirm: (folderKey: string | null) => void;
  onClose: () => void;
};

/** Modal pilih folder tujuan (termasuk "Umum"); opsi di `disabledKeys` tidak bisa dipilih. */
export function FolderPickerModal({ opened, title, confirmLabel, options, disabledKeys = [], onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [wasOpened, setWasOpened] = useState(opened);
  // Reset pilihan tiap modal dibuka (pola "adjust state on prop change", tanpa effect).
  if (opened !== wasOpened) {
    setWasOpened(opened);
    if (opened) setSelected(null);
  }

  const selectable = selectableFolderOptions(options, disabledKeys);
  const kosong = selectable.length === 0;
  const selectedValid = selected !== null && selectable.some((o) => folderPickerValue(o.key) === selected);

  return (
    <Modal opened={opened} onClose={onClose} centered title={<Text fw="bold">{title}</Text>}>
      <Stack gap="md">
        {kosong ? (
          <Stack align="center" gap={4} py="md" data-testid="folder-picker-kosong">
            <IconFolderOpen size={32} stroke={1.5} />
            <Text fz="sm" ta="center">
              Belum ada folder lain yang bisa dipilih.
            </Text>
            <Text fz="xs" c="dimmed" ta="center">
              Tambahkan folder terlebih dulu lewat tombol &quot;Tambah folder&quot;.
            </Text>
          </Stack>
        ) : (
          <Radio.Group value={selected} onChange={setSelected} aria-label={title}>
            <Stack gap="xs">
              {options.map((o) => {
                const disabled = disabledKeys.includes(o.key);
                const value = folderPickerValue(o.key);
                return (
                  <Radio
                    key={value}
                    value={value}
                    disabled={disabled}
                    data-folder-option={value}
                    data-disabled={disabled || undefined}
                    label={
                      <Group gap={6} wrap="nowrap">
                        <IconFolder size={16} style={{ flexShrink: 0 }} />
                        <Text fz="sm" inherit>
                          {o.nama}
                        </Text>
                      </Group>
                    }
                    description={`${o.jumlah} dokumen${disabled ? ' · tidak bisa dipilih' : ''}`}
                  />
                );
              })}
            </Stack>
          </Radio.Group>
        )}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={!selectedValid} onClick={() => selected !== null && onConfirm(folderPickerKey(selected))}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
