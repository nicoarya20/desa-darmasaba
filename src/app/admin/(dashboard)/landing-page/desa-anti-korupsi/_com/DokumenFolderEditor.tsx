'use client';
import { FOLDER_UMUM_KEY } from '@/lib/desa-anti-korupsi-folder';
import { Alert, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { duplicateFileError } from '../_lib/dokumen-bulk';
import { orderedDokumenKeys } from '../_lib/dokumen-bulk-actions';
import { draftsFromFiles, type DokumenDraft } from '../_lib/dokumen-draft';
import { groupDrafts, moveDraftToFolder, moveDraftWithinFolder, type IsiDraft } from '../_lib/folder-draft';
import { filterDraftGroups, posisiDraft, sortFolderAction } from '../_lib/urut-draft';
import { DokumenBulkActions, showNotice } from './DokumenBulkActions';
import { DokumenCariBox } from './DokumenCariBox';
import { DokumenGroupAccordion, folderKeyOfValue as toFolderKey, folderValueOf as toValue } from './DokumenGroupAccordion';
import { DokumenPreviewDialog } from './DokumenPreviewDialog';
import { DokumenUploadZone } from './DokumenUploadZone';
import { FolderManager } from './FolderManager';
import { useDokumenSelection } from './useDokumenSelection';

/** URL pratinjau draft: object URL untuk berkas lokal (dicabut saat berganti), link server untuk yang tersimpan. */
function usePreviewUrl(draft: DokumenDraft | null): string | null {
  const file = draft?.file;
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl],
  );
  return objectUrl ?? draft?.link ?? null;
}

type Props = { value: IsiDraft; onChange: (next: IsiDraft) => void };

/** Editor isi program: kelola folder, unggah ke folder terpilih, cari/urutkan/pindahkan dokumen, aksi massal terpilih. */
export function DokumenFolderEditor({ value, onChange }: Props) {
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [target, setTarget] = useState<string>(FOLDER_UMUM_KEY);
  const [opened, setOpened] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const previewDraft = value.dokumen.find((d) => d.key === previewKey) ?? null;
  const previewUrl = usePreviewUrl(previewDraft);

  const groups = groupDrafts(value);
  // Pencarian hanya menyaring tampilan: "Pilih semua" & rentang Shift+klik memakai dokumen yang terlihat,
  // sedangkan aksi massal tetap berlaku pada semua key terpilih.
  const searching = query.trim() !== '';
  const visibleGroups = filterDraftGroups(groups, query);
  const shownCount = visibleGroups.reduce((n, g) => n + g.dokumen.length, 0);
  const { selection, toggle, selectAll, replace } = useDokumenSelection(value.dokumen, orderedDokumenKeys(visibleGroups));
  const fileError = duplicateFileError(value);
  const folderOptions = groups.map((g) => ({ value: toValue(g.key), label: g.nama.trim() || '(tanpa nama)' }));
  // Folder tujuan yang sudah dihapus → kembali ke "Umum".
  const safeTarget = folderOptions.some((o) => o.value === target) ? target : FOLDER_UMUM_KEY;

  const updateDokumen = (key: string, patch: Partial<DokumenDraft>) =>
    onChange({ ...value, dokumen: value.dokumen.map((d) => (d.key === key ? { ...d, ...patch } : d)) });

  const remove = (key: string) => {
    if (previewKey === key) setPreviewKey(null);
    onChange({ ...value, dokumen: value.dokumen.filter((d) => d.key !== key) });
  };

  const sortFolder = (folderKey: string | null, optionValue: string) => {
    const outcome = sortFolderAction(value, folderKey, optionValue);
    if (outcome.isi !== value) onChange(outcome.isi);
    showNotice(outcome);
  };

  const drop = (files: File[]) => {
    onChange({ ...value, dokumen: [...value.dokumen, ...draftsFromFiles(files, toFolderKey(safeTarget))] });
    setOpened((prev) => (prev.includes(safeTarget) ? prev : [...prev, safeTarget]));
  };

  return (
    <Stack gap="md">
      <FolderManager value={value} onChange={onChange} />
      <DokumenUploadZone folderOptions={folderOptions} target={safeTarget} onTargetChange={setTarget} onDrop={drop} />

      <Text fw="bold" fz="sm">
        Dokumen ({value.dokumen.length})
      </Text>
      {fileError && (
        <Alert color="red" variant="light" p="xs" icon={<IconAlertTriangle size={16} />} title="Belum bisa disimpan">
          <Text fz="xs">{fileError}. Hapus salah satunya atau pindahkan ke folder lain.</Text>
        </Alert>
      )}
      {value.dokumen.length > 0 && (
        <DokumenCariBox query={query} onQueryChange={setQuery} shown={shownCount} total={value.dokumen.length} />
      )}
      <DokumenGroupAccordion
        groups={visibleGroups}
        folderOptions={folderOptions}
        selection={selection}
        // Selama mencari semua kelompok yang cocok dibuka agar hasil langsung terlihat.
        opened={searching ? visibleGroups.map((g) => toValue(g.key)) : opened}
        onOpenedChange={setOpened}
        posisi={posisiDraft(groups)}
        reorderLocked={searching}
        onSortFolder={sortFolder}
        onToggleSelect={toggle}
        onSelectAll={selectAll}
        onJudul={(key, judul) => updateDokumen(key, { judul })}
        onFolder={(key, v) => onChange(moveDraftToFolder(value, key, toFolderKey(v)))}
        onMove={(key, direction) => onChange(moveDraftWithinFolder(value, key, direction))}
        onPreview={setPreviewKey}
        onRemove={remove}
      />
      <DokumenBulkActions value={value} selection={selection} onChange={onChange} onSelectionChange={replace} />

      <DokumenPreviewDialog
        preview={
          previewDraft && previewUrl
            ? { src: previewUrl, title: previewDraft.judul || previewDraft.realName || 'Dokumen' }
            : null
        }
        onClose={() => setPreviewKey(null)}
      />
    </Stack>
  );
}
