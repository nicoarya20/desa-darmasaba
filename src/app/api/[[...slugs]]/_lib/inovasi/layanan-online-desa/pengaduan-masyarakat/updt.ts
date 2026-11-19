import { Context } from "elysia";
import prisma from "@/lib/prisma";
import { PENGADUAN_STATUS, PENGADUAN_TANGGAPAN_MAX, parsePengaduanStatus } from "@/lib/pengaduan-status";
import { sanitizeTanggapan } from "@/lib/pengaduan-tanggapan-server";

type FormUpdate = { status: string; tanggapan?: string };

/**
 * PUT admin: ubah status tindak lanjut + tanggapan (teks polos, ≤ PENGADUAN_TANGGAPAN_MAX). `tanggapanAt` diisi
 * server hanya saat isi tanggapan berubah; tanggapan kosong menghapusnya. Role admin dijaga di index.ts.
 */
export default async function pengaduanMasyarakatUpdate(context: Context) {
  const id = context.params?.id as string;
  const body = context.body as FormUpdate;

  const status = parsePengaduanStatus(body.status);
  if (!status) {
    context.set.status = 400;
    return { success: false, message: `Status tidak valid, gunakan salah satu dari: ${PENGADUAN_STATUS.join(", ")}` };
  }

  const tanggapanBaru = body.tanggapan === undefined ? undefined : sanitizeTanggapan(body.tanggapan);
  if (tanggapanBaru !== undefined && tanggapanBaru.length > PENGADUAN_TANGGAPAN_MAX) {
    context.set.status = 400;
    return { success: false, message: `Tanggapan maksimal ${PENGADUAN_TANGGAPAN_MAX} karakter` };
  }

  try {
    const existing = await prisma.pengaduanMasyarakat.findUnique({ where: { id }, select: { id: true, tanggapan: true } });
    if (!existing) {
      context.set.status = 404;
      return { success: false, message: "Pengaduan masyarakat tidak ditemukan" };
    }

    const tanggapanBerubah = tanggapanBaru !== undefined && tanggapanBaru !== (existing.tanggapan ?? "");
    const updated = await prisma.pengaduanMasyarakat.update({
      where: { id },
      data: {
        status,
        ...(tanggapanBerubah && {
          tanggapan: tanggapanBaru || null,
          tanggapanAt: tanggapanBaru ? new Date() : null,
        }),
      },
      select: { id: true, status: true, tanggapan: true, tanggapanAt: true },
    });
    return { success: true, message: "Berhasil memperbarui status pengaduan", data: updated };
  } catch (error) {
    console.error(`Gagal memperbarui pengaduan ${id}:`, error instanceof Error ? error.message : error);
    context.set.status = 500;
    return { success: false, message: "Gagal memperbarui status pengaduan" };
  }
}
