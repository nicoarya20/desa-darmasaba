'use client';
import { FOLDER_UMUM_KEY } from '@/lib/desa-anti-korupsi-folder';
import { Alert, Button, Group, Loader, Modal, Select, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import type { DokumenDraft } from '../_lib/dokumen-draft';
import { fetchFolderTujuan, fetchProgramTujuan, salinKeProgram, type ProgramTujuan } from '../_lib/salin-api';
import {
  folderTujuanOptions,
  pisahDokumenSalin,
  programTujuanOptions,
  salinBlockedReason,
  salinPayload,
  salinProgramNotice,
  type SalinOption,
} from '../_lib/salin-program';
import { showNotice } from './DokumenBulkActions';

type FormProps = {
  programOptions: SalinOption[] | null;
  programValue: string | null;
  onProgramChange: (value: string | null) => void;
  folderOptions: SalinOption[] | null;
  folderValue: string;
  onFolderChange: (value: string) => void;
  savedCount: number;
  unsavedCount: number;
  blockedReason: string | null;
  error: string | null;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

/** Isi modal salin (presentasional): pilih program & folder tujuan, info dokumen, tombol Salin. */
export function SalinKeProgramForm(p: FormProps) {
  return (
    <Stack gap="sm">
      <Alert variant="light" color="blue" p="xs" icon={<IconInfoCircle size={16} />}>
        <Text fz="xs">
          Salinan langsung tersimpan di program tujuan dan tidak mengubah draft program ini. Yang disalin adalah versi
          dokumen yang sudah tersimpan — perubahan yang belum disimpan tidak ikut.
        </Text>
      </Alert>
      <Text fz="sm" data-salin-info="tersimpan">
        {p.savedCount} dokumen tersimpan akan disalin.
      </Text>
      {p.unsavedCount > 0 && (
        <Text fz="xs" c="orange" data-salin-info="dilewati">
          {p.unsavedCount} dokumen baru belum disimpan dilewati.
        </Text>
      )}
      {p.programOptions === null ? (
        <Group gap="xs">
          <Loader size="xs" />
          <Text fz="xs" c="dimmed">
            Memuat daftar program…
          </Text>
        </Group>
      ) : (
        <Select
          label="Program tujuan"
          placeholder="Cari program…"
          data={p.programOptions}
          value={p.programValue}
          onChange={p.onProgramChange}
          searchable
          nothingFoundMessage="Program tidak ditemukan"
          data-salin-program
        />
      )}
      {p.programValue !== null && (
        <Select
          label="Folder tujuan"
          data={p.folderOptions ?? []}
          value={p.folderValue}
          onChange={(v) => v && p.onFolderChange(v)}
          allowDeselect={false}
          disabled={p.folderOptions === null}
          rightSection={p.folderOptions === null ? <Loader size="xs" /> : undefined}
        />
      )}
      {(p.error ?? p.blockedReason) && (
        <Text fz="xs" c={p.error ? 'red' : 'dimmed'} role={p.error ? 'alert' : undefined}>
          {p.error ?? p.blockedReason}
        </Text>
      )}
      <Group justify="flex-end" gap="xs">
        <Button variant="default" onClick={p.onCancel} disabled={p.saving}>
          Batal
        </Button>
        <Button onClick={p.onSubmit} loading={p.saving} disabled={p.blockedReason !== null || p.folderOptions === null}>
          Salin
        </Button>
      </Group>
    </Stack>
  );
}

type Props = {
  opened: boolean;
  /** Program yang sedang diedit — dikecualikan dari pilihan tujuan. */
  programId: string;
  /** Draft dokumen terpilih; yang belum tersimpan (tanpa id) dilewati. */
  dokumen: DokumenDraft[];
  onClose: () => void;
  /** Dipanggil setelah salin berhasil (draft program ini tidak berubah). */
  onDone?: () => void;
};

/** Modal "Salin ke program lain…": muat program & folder tujuan, POST salin, toast hasil. */
export function SalinKeProgramModal({ opened, programId, dokumen, onClose, onDone }: Props) {
  const [programs, setPrograms] = useState<ProgramTujuan[] | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [folders, setFolders] = useState<SalinOption[] | null>(null);
  const [folderValue, setFolderValue] = useState(FOLDER_UMUM_KEY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { dokumenIds, belumTersimpan } = pisahDokumenSalin(dokumen);

  useEffect(() => {
    if (!opened) return;
    let aktif = true;
    setPrograms(null);
    setTarget(null);
    setError(null);
    fetchProgramTujuan().then((res) => {
      if (!aktif) return;
      setPrograms(res.ok ? res.data : []);
      if (!res.ok) setError(res.message);
    });
    return () => {
      aktif = false;
    };
  }, [opened]);

  useEffect(() => {
    if (!target) return;
    let aktif = true;
    setFolders(null);
    setFolderValue(FOLDER_UMUM_KEY);
    fetchFolderTujuan(target).then((res) => {
      if (!aktif) return;
      setFolders(res.ok ? folderTujuanOptions(res.data) : null);
      setError(res.ok ? null : res.message);
    });
    return () => {
      aktif = false;
    };
  }, [target]);

  const submit = async () => {
    if (!target || salinBlockedReason(dokumenIds, target) !== null) return;
    setSaving(true);
    const res = await salinKeProgram(salinPayload(dokumenIds, target, folderValue));
    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      showNotice({ message: res.message, tone: 'error' });
      return;
    }
    const nama = programs?.find((p) => p.id === target)?.name ?? 'program tujuan';
    showNotice(salinProgramNotice(res.data, nama));
    onDone?.();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Salin ${dokumen.length} dokumen ke program lain`} centered>
      <SalinKeProgramForm
        programOptions={programs === null ? null : programTujuanOptions(programs, programId)}
        programValue={target}
        onProgramChange={setTarget}
        folderOptions={target ? folders : []}
        folderValue={folderValue}
        onFolderChange={setFolderValue}
        savedCount={dokumenIds.length}
        unsavedCount={belumTersimpan}
        blockedReason={salinBlockedReason(dokumenIds, target)}
        error={error}
        saving={saving}
        onSubmit={submit}
        onCancel={onClose}
      />
    </Modal>
  );
}
