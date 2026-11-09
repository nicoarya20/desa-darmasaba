'use client';
import { FOLDER_UMUM_KEY } from '@/lib/desa-anti-korupsi-folder';
import { Accordion, Badge, Box, Checkbox, Group, Stack, Text } from '@mantine/core';
import { IconFolder } from '@tabler/icons-react';
import { selectionStateOf, type Selection } from '../_lib/dokumen-selection';
import type { DraftGroup } from '../_lib/folder-draft';
import { DokumenDraftRow } from './DokumenDraftRow';
import { UrutFolderMenu } from './UrutFolderMenu';

/** Value Select/Accordion untuk folderKey draft (null = folder virtual "Umum"). */
export const folderValueOf = (folderKey: string | null) => folderKey ?? FOLDER_UMUM_KEY;

/** Kebalikan `folderValueOf`: value Select/Accordion → folderKey draft. */
export const folderKeyOfValue = (value: string) => (value === FOLDER_UMUM_KEY ? null : value);

type Props = {
  groups: DraftGroup[];
  folderOptions: { value: string; label: string }[];
  selection: Selection;
  opened: string[];
  onOpenedChange: (value: string[]) => void;
  onToggleSelect: (key: string, shiftKey: boolean) => void;
  onSelectAll: (keys: string[], checked: boolean) => void;
  onJudul: (key: string, judul: string) => void;
  onFolder: (key: string, folderValue: string) => void;
  onMove: (key: string, direction: -1 | 1) => void;
  onPreview: (key: string) => void;
  onRemove: (key: string) => void;
  /** "Urutkan menurut…" per folder (tulis ulang urutan di draft); tanpa prop ini menu tidak tampil. */
  onSortFolder?: (folderKey: string | null, optionValue: string) => void;
  /** Posisi asli dokumen di foldernya — dipakai saat `groups` sudah disaring pencarian. */
  posisi?: ReadonlyMap<string, { index: number; total: number }>;
  /** Kunci naik/turun urutan (mis. selama mencari, karena tetangga bisa tersembunyi). */
  reorderLocked?: boolean;
};

/** Daftar dokumen per folder (Accordion): header berisi "Pilih semua" + nama + jumlah + urutkan, isi = baris draft. */
export function DokumenGroupAccordion({
  groups,
  folderOptions,
  selection,
  opened,
  onOpenedChange,
  onSortFolder,
  posisi,
  reorderLocked = false,
  ...on
}: Props) {
  return (
    <Accordion multiple variant="separated" radius="md" value={opened} onChange={onOpenedChange}>
      {groups.map((g) => {
        const value = folderValueOf(g.key);
        const nama = g.nama.trim() || '(tanpa nama)';
        const keys = g.dokumen.map((d) => d.key);
        const state = selectionStateOf(selection, keys);
        return (
          <Accordion.Item key={value} value={value}>
            {/* Checkbox di luar Accordion.Control: input di dalam <button> tidak valid & klik ikut membuka panel. */}
            <Box display="flex" pl="sm" style={{ alignItems: 'center' }} data-group-key={value}>
              <Checkbox
                size="sm"
                aria-label={`Pilih semua dokumen di ${nama}`}
                data-selection-state={state}
                checked={state === 'all'}
                indeterminate={state === 'some'}
                disabled={keys.length === 0}
                onChange={() => on.onSelectAll(keys, state !== 'all')}
              />
              <Accordion.Control icon={<IconFolder size={16} />} style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" wrap="nowrap">
                  <Text fz="sm" fw={600} truncate>
                    {nama}
                  </Text>
                  <Badge size="sm" variant="light" style={{ flexShrink: 0 }}>
                    {g.dokumen.length}
                  </Badge>
                </Group>
              </Accordion.Control>
              {onSortFolder && (
                <UrutFolderMenu namaFolder={nama} count={g.dokumen.length} onSelect={(o) => onSortFolder(g.key, o)} />
              )}
            </Box>
            <Accordion.Panel>
              <Stack gap={6}>
                {g.dokumen.length === 0 && (
                  <Text fz="xs" c="dimmed">
                    Folder kosong
                  </Text>
                )}
                {g.dokumen.map((d, i) => {
                  const { index, total } = posisi?.get(d.key) ?? { index: i, total: g.dokumen.length };
                  return (
                    <DokumenDraftRow
                      key={d.key}
                      draft={d}
                      index={index}
                      total={total}
                      moveLocked={reorderLocked}
                      folderOptions={folderOptions}
                      folderValue={value}
                      selected={selection.has(d.key)}
                      onToggleSelect={(shiftKey) => on.onToggleSelect(d.key, shiftKey)}
                      onJudul={(judul) => on.onJudul(d.key, judul)}
                      onFolder={(v) => on.onFolder(d.key, v)}
                      onMove={(direction) => on.onMove(d.key, direction)}
                      onPreview={() => on.onPreview(d.key)}
                      onRemove={() => on.onRemove(d.key)}
                    />
                  );
                })}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
