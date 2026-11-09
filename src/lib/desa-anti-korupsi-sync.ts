// Perencanaan sinkronisasi isi program Desa Anti Korupsi (folder + dokumen) — murni, tanpa I/O.
// API memakai hasilnya untuk menulis semuanya dalam satu transaksi.
import { parseDokumenList, planDokumenSync, type DokumenSyncPlan, type DokumenTersimpan } from "./desa-anti-korupsi-dokumen";
import {
  parseFolderList,
  planFolderSync,
  type FolderSyncPlan,
  type FolderTersimpan,
} from "./desa-anti-korupsi-folder";

/** Isi program yang sudah tersimpan (aktif saja). */
export type ProgramIsiTersimpan = { folders: FolderTersimpan[]; dokumen: DokumenTersimpan[] };

/** Payload mentah dari body: `undefined` = bagian itu tidak disentuh. */
export type ProgramIsiInput = { folders?: unknown; dokumen?: unknown };

/** Rencana sinkron; `null` = bagian tersebut tidak dikirim sehingga tidak diubah. */
export type ProgramSyncPlan = { folders: FolderSyncPlan | null; dokumen: DokumenSyncPlan | null };

export type ProgramSyncResult = { ok: true; plan: ProgramSyncPlan } | { ok: false; message: string };

/**
 * Validasi & rencanakan sinkron folder + dokumen. Rujukan folder dokumen harus menunjuk folder
 * final program (folder lama yang tetap dikirim, atau `tempKey` dari daftar folder request ini).
 */
export function planProgramSync(existing: ProgramIsiTersimpan, input: ProgramIsiInput): ProgramSyncResult {
  let folderPlan: FolderSyncPlan | null = null;
  let finalIds = new Set(existing.folders.map((f) => f.id));
  const tempKeys = new Set<string>();

  if (input.folders !== undefined) {
    const parsed = parseFolderList(input.folders);
    if (!parsed.ok) return parsed;
    const planned = planFolderSync(existing.folders, parsed.data);
    if (!planned.ok) return planned;
    folderPlan = planned.plan;
    finalIds = new Set(parsed.data.flatMap((f) => (f.id ? [f.id] : [])));
    for (const f of parsed.data) if (f.tempKey) tempKeys.add(f.tempKey);
  }

  if (input.dokumen === undefined) return { ok: true, plan: { folders: folderPlan, dokumen: null } };

  const parsed = parseDokumenList(input.dokumen);
  if (!parsed.ok) return parsed;

  for (const [index, d] of parsed.data.entries()) {
    const label = `Dokumen #${index + 1}`;
    if (d.folder === null) continue;
    if ("id" in d.folder && !finalIds.has(d.folder.id)) {
      return { ok: false, message: `${label}: folder tidak ditemukan pada program ini` };
    }
    if ("tempKey" in d.folder && !tempKeys.has(d.folder.tempKey)) {
      return { ok: false, message: `${label}: folder baru tidak ada di daftar folder` };
    }
  }

  const planned = planDokumenSync(existing.dokumen, parsed.data);
  if (!planned.ok) return planned;
  return { ok: true, plan: { folders: folderPlan, dokumen: planned.plan } };
}
