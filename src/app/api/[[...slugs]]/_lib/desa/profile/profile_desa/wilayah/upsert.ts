import prisma from "@/lib/prisma";
import { WILAYAH_DESA_SELECT } from "./find";
import { WILAYAH_DESA_ID, parseWilayahDesaInput, periksaFilePeta } from "@/lib/wilayah-desa";
import removeReleasedFiles from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

/** PUT admin: simpan (buat/perbarui) satu-satunya baris wilayah desa; idempoten. */
export default async function wilayahDesaUpsert(body: unknown) {
  const parsed = parseWilayahDesaInput(body);
  if (!parsed.ok) {
    return Response.json(
      { success: false, message: parsed.message },
      { status: 400 },
    );
  }

  try {
    const { petaFileId } = parsed.data;
    if (petaFileId) {
      const file = await prisma.fileStorage.findFirst({
        where: { id: petaFileId, isActive: true },
        select: { mimeType: true },
      });
      const cek = periksaFilePeta(file);
      if (!cek.ok) {
        return Response.json({ success: false, message: cek.message }, { status: 400 });
      }
    }

    // File peta lama hanya perlu dibandingkan bila body mengubahnya.
    const existing =
      petaFileId === undefined
        ? null
        : await prisma.wilayahDesa.findUnique({
            where: { id: WILAYAH_DESA_ID },
            select: { petaFileId: true },
          });

    const data = await prisma.wilayahDesa.upsert({
      where: { id: WILAYAH_DESA_ID },
      create: { id: WILAYAH_DESA_ID, ...parsed.data },
      update: { ...parsed.data, isActive: true, deletedAt: null },
      select: WILAYAH_DESA_SELECT,
    });

    // File peta yang diganti/dihapus dihapus permanen setelah simpan sukses.
    await removeReleasedFiles("WilayahDesa", [existing?.petaFileId], [data.petaFileId]);

    return Response.json(
      { success: true, message: "Data wilayah desa berhasil disimpan", data },
      { status: 200 },
    );
  } catch (error) {
    console.error("Gagal menyimpan data wilayah desa:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan saat menyimpan data wilayah desa" },
      { status: 500 },
    );
  }
}
