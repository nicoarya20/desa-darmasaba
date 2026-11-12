import prisma from "@/lib/prisma";
import {
  PENGUMUMAN_DETAIL_INCLUDE,
  susunDataUpdate,
  type PengumumanBody,
} from "@/lib/pengumuman-lampiran";
import { Context } from "elysia";
import { validasiLampiran } from "./lampiran-check";
import removeReleasedFiles, { fileIds } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

/** Rujukan berkas pengumuman yang dibandingkan sebelum/sesudah update. */
const BERKAS_SELECT = {
  id: true,
  imageId: true,
  images: { select: { id: true } },
  dokumen: { select: { id: true } },
} as const;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** Update pengumuman; lampiran/tanggal yang tidak dikirim tidak diubah, array = set final. */
async function pengumumanUpdate(context: Context) {
  try {
    const id = context.params?.id as string; // ambil dari URL
    const body = (await context.body) as PengumumanBody;

    if (!id) {
      return json({ success: false, message: "ID tidak boleh kosong" }, 400);
    }

    const existing = await prisma.pengumuman.findUnique({ where: { id }, select: BERKAS_SELECT });
    if (!existing) {
      return json({ success: false, message: "pengumuman tidak ditemukan" }, 404);
    }

    const lampiran = await validasiLampiran(body);
    if (!lampiran.ok) {
      return json({ success: false, message: lampiran.message }, 400);
    }

    const updated = await prisma.pengumuman.update({
      where: { id },
      data: susunDataUpdate(body, lampiran.data),
      include: PENGUMUMAN_DETAIL_INCLUDE,
    });

    // Berkas yang dilepas (gambar utama/galeri/dokumen) dipindah ke Sampah setelah update sukses.
    await removeReleasedFiles(
      "Pengumuman",
      fileIds(existing.imageId, existing.images, existing.dokumen),
      fileIds(updated.imageId, updated.images, updated.dokumen),
    );

    return json({ success: true, message: "pengumuman berhasil diupdate", data: updated }, 200);
  } catch (error) {
    console.error("Error updating pengumuman:", error);
    return json({ success: false, message: "Terjadi kesalahan saat mengupdate pengumuman" }, 500);
  }
}
export default pengumumanUpdate;
