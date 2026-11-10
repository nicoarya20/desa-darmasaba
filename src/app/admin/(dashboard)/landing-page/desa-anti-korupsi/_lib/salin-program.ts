// Logika murni "Salin ke program lain": pilihan program & folder tujuan, pemisahan dokumen tersimpan
// vs draft baru, payload, dan notifikasi hasil. Panggilan API ada di salin-api.ts.
import { FOLDER_UMUM_KEY, FOLDER_UMUM_LABEL } from '@/lib/desa-anti-korupsi-folder';
import { SALIN_MAX_DOKUMEN, type SalinInput } from '@/lib/desa-anti-korupsi-salin';
import type { Notice } from './dokumen-bulk-actions';
import type { DokumenDraft } from './dokumen-draft';
import type { FolderTujuan, ProgramTujuan, SalinHasil } from './salin-api';

/** Opsi Select (value + label). */
export type SalinOption = { value: string; label: string };

/** Program tujuan: semua program kecuali program yang sedang diedit. */
export function programTujuanOptions(programs: readonly ProgramTujuan[], currentProgramId: string): SalinOption[] {
  return programs.filter((p) => p.id !== currentProgramId).map((p) => ({ value: p.id, label: p.name.trim() || '(tanpa nama)' }));
}

/** Folder tujuan: folder program tujuan berurutan + "Umum" (value FOLDER_UMUM_KEY) di akhir. */
export function folderTujuanOptions(folders: readonly FolderTujuan[]): SalinOption[] {
  return [
    ...folders.map((f) => ({ value: f.id, label: f.nama.trim() || '(tanpa nama)' })),
    { value: FOLDER_UMUM_KEY, label: FOLDER_UMUM_LABEL },
  ];
}

/** Dokumen terpilih yang bisa disalin (punya id tersimpan, unik, urut draft) + jumlah draft baru yang dilewati. */
export function pisahDokumenSalin(dokumen: readonly DokumenDraft[]): { dokumenIds: string[]; belumTersimpan: number } {
  const ids = dokumen.flatMap((d) => (d.id ? [d.id] : []));
  return { dokumenIds: [...new Set(ids)], belumTersimpan: dokumen.length - ids.length };
}

/** Alasan tombol Salin dinonaktifkan, atau null bila siap. */
export function salinBlockedReason(dokumenIds: readonly string[], targetProgramId: string | null): string | null {
  if (dokumenIds.length === 0) return 'Tidak ada dokumen tersimpan yang dipilih — simpan program dulu untuk menyalin dokumen baru.';
  if (dokumenIds.length > SALIN_MAX_DOKUMEN) return `Maksimal ${SALIN_MAX_DOKUMEN} dokumen per salin.`;
  if (!targetProgramId) return 'Pilih program tujuan.';
  return null;
}

/** Payload POST salin; value folder "Umum" → targetFolderId null. */
export function salinPayload(dokumenIds: readonly string[], targetProgramId: string, folderValue: string): SalinInput {
  return {
    dokumenIds: [...dokumenIds],
    targetProgramId,
    targetFolderId: folderValue === FOLDER_UMUM_KEY ? null : folderValue,
  };
}

/** Notifikasi hasil salin ke program lain: "N dokumen disalin ke "X"" + jumlah yang dilewati. */
export function salinProgramNotice({ copied, skipped }: SalinHasil, programName: string): Notice {
  const lewati = skipped > 0 ? `, ${skipped} dilewati karena sudah ada di folder tujuan` : '';
  if (copied === 0) {
    return { message: `Tidak ada dokumen baru disalin ke "${programName}"${lewati}`, tone: 'info' };
  }
  return { message: `${copied} dokumen disalin ke "${programName}"${lewati}`, tone: 'success' };
}
