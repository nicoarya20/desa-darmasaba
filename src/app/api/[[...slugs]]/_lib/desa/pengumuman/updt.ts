import prisma from "@/lib/prisma";
import {
  PENGUMUMAN_DETAIL_INCLUDE,
  susunDataUpdate,
  type PengumumanBody,
} from "@/lib/pengumuman-lampiran";
import { Context } from "elysia";
import { validasiLampiran } from "./lampiran-check";

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

    const existing = await prisma.pengumuman.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return json({ success: false, message: "pengumuman tidak ditemukan" }, 404);
    }

    const lampiran = await validasiLampiran(body);
    if (!lampiran.ok) {
      return json({ success: false, message: lampiran.message }, 400);
    }

    // Berkas MinIO lampiran yang dilepas tidak dihapus (sama seperti dokumen Desa Anti Korupsi):
    // repo belum punya pembersih berkas yatim — lihat docs/decisions/2026-11-10-pengumuman-lampiran.md.
    const updated = await prisma.pengumuman.update({
      where: { id },
      data: susunDataUpdate(body, lampiran.data),
      include: PENGUMUMAN_DETAIL_INCLUDE,
    });

    return json({ success: true, message: "pengumuman berhasil diupdate", data: updated }, 200);
  } catch (error) {
    console.error("Error updating pengumuman:", error);
    return json({ success: false, message: "Terjadi kesalahan saat mengupdate pengumuman" }, 500);
  }
}
export default pengumumanUpdate;
