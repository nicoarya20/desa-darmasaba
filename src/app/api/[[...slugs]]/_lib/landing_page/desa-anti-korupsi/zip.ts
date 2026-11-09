import AdmZip from "adm-zip";
import { Context } from "elysia";
import prisma from "@/lib/prisma";
import minio, { MINIO_BUCKET } from "@/lib/minio";
import { readFileContent, resolveStoredSize } from "@/lib/file-storage-size";
import { FOLDER_UMUM_KEY, FOLDER_UMUM_LABEL } from "@/lib/desa-anti-korupsi-folder";
import {
  attachmentDisposition,
  dakZipMaxBytes,
  planZipEntries,
  zipFileName,
  zipLimitError,
  type ZipDokumen,
} from "@/lib/desa-anti-korupsi-zip";

const FILE_SELECT = { path: true, name: true, mimeType: true, realName: true, size: true } as const;
type ZipFile = { path: string; name: string; mimeType: string; realName: string; size: number | null };

const fail = (context: Context, status: number, message: string) => {
  context.set.status = status;
  return { success: false, message };
};

/**
 * GET /:id/zip?folder=<folderId|umum> — unduh dokumen aktif program sebagai ZIP (publik).
 * Tanpa `folder` = seluruh program, satu subfolder per folder + "Umum"; dengan `folder` = isi folder itu saja.
 */
export default async function desaAntiKorupsiZip(context: Context) {
  const id = context.params?.id as string;
  const folderKey = (context.query?.folder as string | undefined)?.trim() || null;

  const program = await prisma.desaAntiKorupsi.findFirst({
    where: { id, isActive: true },
    select: {
      name: true,
      folders: { where: { isActive: true }, orderBy: [{ urutan: "asc" }, { createdAt: "asc" }], select: { id: true, nama: true } },
      dokumen: {
        where: { isActive: true },
        orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
        select: { judul: true, folderId: true, file: { select: FILE_SELECT } },
      },
    },
  });
  if (!program) return fail(context, 404, "Program desa anti korupsi tidak ditemukan");

  const folderNama = new Map(program.folders.map((f) => [f.id, f.nama]));
  // Sama dengan toProgramDetail: dokumen tanpa folder aktif termasuk "Umum".
  const keyOf = (folderId: string | null) => (folderId && folderNama.has(folderId) ? folderId : FOLDER_UMUM_KEY);

  if (folderKey && folderKey !== FOLDER_UMUM_KEY && !folderNama.has(folderKey)) {
    return fail(context, 404, "Folder dokumen tidak ditemukan");
  }

  // Urutan entri mengikuti tampilan: folder berurutan, lalu "Umum".
  const order = [...program.folders.map((f) => f.id), FOLDER_UMUM_KEY];
  const dokumen: ZipDokumen<ZipFile>[] = program.dokumen
    .filter((d) => !folderKey || keyOf(d.folderId) === folderKey)
    .sort((a, b) => order.indexOf(keyOf(a.folderId)) - order.indexOf(keyOf(b.folderId)))
    .map((d) => {
      const key = keyOf(d.folderId);
      const nama = key === FOLDER_UMUM_KEY ? FOLDER_UMUM_LABEL : (folderNama.get(key) as string);
      return { judul: d.judul, folderNama: folderKey ? null : nama, file: d.file };
    });
  if (dokumen.length === 0) return fail(context, 404, "Tidak ada dokumen untuk diunduh");

  const entries = planZipEntries(dokumen);
  try {
    const sizes = await Promise.all(
      entries.map((e) => e.file.size ?? resolveStoredSize(minio, MINIO_BUCKET, e.file)),
    );
    const limitError = zipLimitError(
      sizes.reduce((sum, s) => sum + s, 0),
      dakZipMaxBytes(),
    );
    if (limitError) return fail(context, 413, limitError);

    const zip = new AdmZip();
    for (const entry of entries) {
      zip.addFile(entry.path, await readFileContent(minio, MINIO_BUCKET, entry.file));
    }
    const buffer = zip.toBuffer();

    const label = folderKey === FOLDER_UMUM_KEY ? FOLDER_UMUM_LABEL : folderKey ? folderNama.get(folderKey) : null;
    context.set.headers = {
      "Content-Type": "application/zip",
      "Content-Length": String(buffer.length),
      "Content-Disposition": attachmentDisposition(zipFileName(program.name, label)),
      "Cache-Control": "no-store",
    };
    return buffer;
  } catch (err) {
    console.error(`ZIP dokumen DAK program ${id} gagal membaca MinIO:`, err);
    return fail(context, 502, "Gagal mengambil berkas dokumen dari penyimpanan");
  }
}
