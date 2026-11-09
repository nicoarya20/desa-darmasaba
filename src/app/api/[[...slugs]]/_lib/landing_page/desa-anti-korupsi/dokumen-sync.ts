import prisma from "@/lib/prisma";
import {
  parseDokumenList,
  planDokumenSync,
  type DokumenSyncResult,
  type DokumenTersimpan,
} from "@/lib/desa-anti-korupsi-dokumen";

/** Pastikan semua fileId menunjuk berkas aktif di FileStorage; kembalikan pesan error atau null. */
export async function checkDokumenFiles(fileIds: string[]): Promise<string | null> {
  if (fileIds.length === 0) return null;
  const found = await prisma.fileStorage.count({
    where: { id: { in: fileIds }, isActive: true },
  });
  return found === fileIds.length ? null : "File dokumen tidak ditemukan atau sudah dihapus";
}

/** Validasi payload dokumen, hitung rencana sinkronisasi terhadap dokumen tersimpan, lalu cek berkas baru. */
export async function prepareDokumenSync(
  existing: DokumenTersimpan[],
  input: unknown,
): Promise<DokumenSyncResult> {
  const parsed = parseDokumenList(input);
  if (!parsed.ok) return parsed;

  const planned = planDokumenSync(existing, parsed.data);
  if (!planned.ok) return planned;

  const fileError = await checkDokumenFiles(planned.plan.create.map((d) => d.fileId));
  if (fileError) return { ok: false, message: fileError };

  return planned;
}
