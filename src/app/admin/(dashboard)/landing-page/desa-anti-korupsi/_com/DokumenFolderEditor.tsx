'use client';
import { FOLDER_UMUM_KEY } from '@/lib/desa-anti-korupsi-folder';
import { Accordion, Badge, Group, Stack, Text } from '@mantine/core';
import { IconFolder } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { draftsFromFiles, type DokumenDraft } from '../_lib/dokumen-draft';
import { groupDrafts, moveDraftToFolder, moveDraftWithinFolder, type IsiDraft } from '../_lib/folder-draft';
import { DokumenDraftRow } from './DokumenDraftRow';
import { DokumenPreviewDialog } from './DokumenPreviewDialog';
import { DokumenUploadZone } from './DokumenUploadZone';
import { FolderManager } from './FolderManager';

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

// Nilai Select/Accordion untuk folder virtual "Umum" (folderKey null di draft).
const toValue = (folderKey: string | null) => folderKey ?? FOLDER_UMUM_KEY;
const toFolderKey = (value: string) => (value === FOLDER_UMUM_KEY ? null : value);

type Props = { value: IsiDraft; onChange: (next: IsiDraft) => void };

/** Editor isi program: kelola folder, unggah banyak berkas ke folder terpilih, atur & pindahkan dokumen. */
export function DokumenFolderEditor({ value, onChange }: Props) {
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [target, setTarget] = useState<string>(FOLDER_UMUM_KEY);
  const [opened, setOpened] = useState<string[]>([]);
  const previewDraft = value.dokumen.find((d) => d.key === previewKey) ?? null;
  const previewUrl = usePreviewUrl(previewDraft);

  const groups = groupDrafts(value);
  const folderOptions = groups.map((g) => ({ value: toValue(g.key), label: g.nama.trim() || '(tanpa nama)' }));
  // Folder tujuan yang sudah dihapus → kembali ke "Umum".
  const safeTarget = folderOptions.some((o) => o.value === target) ? target : FOLDER_UMUM_KEY;

  const updateDokumen = (key: string, patch: Partial<DokumenDraft>) =>
    onChange({ ...value, dokumen: value.dokumen.map((d) => (d.key === key ? { ...d, ...patch } : d)) });

  const remove = (key: string) => {
    if (previewKey === key) setPreviewKey(null);
    onChange({ ...value, dokumen: value.dokumen.filter((d) => d.key !== key) });
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
      <Accordion multiple variant="separated" radius="md" value={opened} onChange={setOpened}>
        {groups.map((g) => (
          <Accordion.Item key={toValue(g.key)} value={toValue(g.key)}>
            <Accordion.Control icon={<IconFolder size={16} />}>
              <Group gap="xs" wrap="nowrap">
                <Text fz="sm" fw={600} truncate>
                  {g.nama.trim() || '(tanpa nama)'}
                </Text>
                <Badge size="sm" variant="light">
                  {g.dokumen.length}
                </Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap={6}>
                {g.dokumen.length === 0 && (
                  <Text fz="xs" c="dimmed">
                    Folder kosong
                  </Text>
                )}
                {g.dokumen.map((d, index) => (
                  <DokumenDraftRow
                    key={d.key}
                    draft={d}
                    index={index}
                    total={g.dokumen.length}
                    folderOptions={folderOptions}
                    folderValue={toValue(g.key)}
                    onJudul={(judul) => updateDokumen(d.key, { judul })}
                    onFolder={(v) => onChange(moveDraftToFolder(value, d.key, toFolderKey(v)))}
                    onMove={(direction) => onChange(moveDraftWithinFolder(value, d.key, direction))}
                    onPreview={() => setPreviewKey(d.key)}
                    onRemove={() => remove(d.key)}
                  />
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

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
