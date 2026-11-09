'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { bulkCopy, bulkDelete, bulkMove, sharedFolderKeys, type BulkOutcome, type Notice } from '../_lib/dokumen-bulk-actions';
import { emptySelection, type Selection } from '../_lib/dokumen-selection';
import { groupDrafts, type IsiDraft } from '../_lib/folder-draft';
import { DokumenSelectionToolbar } from './DokumenSelectionToolbar';
import { FolderPickerModal, folderPickerOptionsFromGroups } from './FolderPickerModal';
import { KonfirmasiHapusDokumenModal } from './KonfirmasiHapusDokumenModal';

/** Tampilkan notifikasi aksi editor DAK lewat react-toastify sesuai nadanya. */
export function showNotice({ message, tone }: Notice): void {
  toast[tone](message);
}

type Mode = 'move' | 'copy' | 'delete' | null;

type Props = {
  value: IsiDraft;
  selection: Selection;
  onChange: (next: IsiDraft) => void;
  onSelectionChange: (next: Selection) => void;
};

/** Toolbar dokumen terpilih + modal pindah/salin (pilih folder) dan konfirmasi hapus; perubahan tetap draft. */
export function DokumenBulkActions({ value, selection, onChange, onSelectionChange }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const count = selection.size;
  const options = folderPickerOptionsFromGroups(groupDrafts(value));
  // Folder asal tidak masuk akal sebagai tujuan (pindah = tidak berubah, salin = semua dilewati).
  const disabledKeys = sharedFolderKeys(value, selection);
  const close = () => setMode(null);

  const apply = (outcome: BulkOutcome) => {
    onChange(outcome.isi);
    onSelectionChange(outcome.selection);
    showNotice(outcome);
    close();
  };

  return (
    <>
      <DokumenSelectionToolbar
        count={count}
        onMove={() => setMode('move')}
        onCopy={() => setMode('copy')}
        onDelete={() => setMode('delete')}
        onClear={() => onSelectionChange(emptySelection())}
      />
      <FolderPickerModal
        opened={mode === 'move'}
        title={`Pindahkan ${count} dokumen ke…`}
        confirmLabel="Pindahkan"
        options={options}
        disabledKeys={disabledKeys}
        onConfirm={(folderKey) => apply(bulkMove(value, selection, folderKey))}
        onClose={close}
      />
      <FolderPickerModal
        opened={mode === 'copy'}
        title={`Salin ${count} dokumen ke…`}
        confirmLabel="Salin"
        options={options}
        disabledKeys={disabledKeys}
        onConfirm={(folderKey) => apply(bulkCopy(value, selection, folderKey))}
        onClose={close}
      />
      <KonfirmasiHapusDokumenModal
        opened={mode === 'delete'}
        count={count}
        onConfirm={() => apply(bulkDelete(value, selection))}
        onClose={close}
      />
    </>
  );
}
