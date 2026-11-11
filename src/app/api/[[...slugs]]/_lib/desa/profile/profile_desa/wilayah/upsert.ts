import prisma from "@/lib/prisma";
import { WILAYAH_DESA_SELECT } from "./find";
import { WILAYAH_DESA_ID, parseWilayahDesaInput } from "@/lib/wilayah-desa";

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
    const data = await prisma.wilayahDesa.upsert({
      where: { id: WILAYAH_DESA_ID },
      create: { id: WILAYAH_DESA_ID, ...parsed.data },
      update: { ...parsed.data, isActive: true, deletedAt: null },
      select: WILAYAH_DESA_SELECT,
    });

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
