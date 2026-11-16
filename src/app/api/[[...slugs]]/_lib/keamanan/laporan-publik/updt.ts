/* eslint-disable @typescript-eslint/no-explicit-any */
import { optionalAuth } from "@/lib/api-auth";
import { AUDIT_ACTIONS, audit } from "@/lib/audit";
import prisma from "@/lib/prisma";
import { sanitizeRichTextForStorage } from "@/lib/rich-text-server";
import { Context } from "elysia";

type LaporanPublikUpdateInput = {
  judul?: string;
  lokasi?: string;
  tanggalWaktu?: string;
  status?: "Selesai" | "Proses" | "Gagal" | "Baru";
  kronologi?: string;
  penanganan?: string;
};

const LaporanPublikUpdate = async (context: Context) => {
  const id = context.params.id as string;
  const { judul, lokasi, tanggalWaktu, status, penanganan, kronologi } =
    (await context.body) as LaporanPublikUpdateInput;

  // Prepare update data with only provided fields
  const updateData: any = {};
  
  if (judul !== undefined) updateData.judul = judul;
  if (lokasi !== undefined) updateData.lokasi = lokasi;
  if (tanggalWaktu !== undefined) updateData.tanggalWaktu = new Date(tanggalWaktu);
  if (status !== undefined) updateData.status = status;
  // Kronologi berasal dari kiriman publik & penanganan dari editor: simpan hanya format teks dasar (cegah XSS tersimpan).
  if (kronologi !== undefined) updateData.kronologi = sanitizeRichTextForStorage(kronologi);

  // Handle penanganan update if provided
  if (penanganan !== undefined) {
    const deskripsi = sanitizeRichTextForStorage(penanganan);
    // Delete existing penanganan
    await prisma.penangananLaporanPublik.deleteMany({
      where: { laporanId: id },
    });

    // Add new penanganan if not empty
    if (deskripsi.trim()) {
      updateData.penanganan = {
        create: {
          deskripsi,
        },
      };
    }
  }

  const before =
    status !== undefined
      ? await prisma.laporanPublik.findUnique({ where: { id }, select: { status: true } })
      : null;

  const updated = await prisma.laporanPublik.update({
    where: { id },
    data: updateData,
    include: {
      penanganan: true,
    },
  });

  // Hanya keputusan moderasi (status) yang diaudit; isi laporan & pelapor tidak dicatat.
  if (before && before.status !== updated.status) {
    await audit({
      // Sesi sudah diwajibkan guard global /api untuk PUT.
      actor: await optionalAuth(),
      action: AUDIT_ACTIONS.LAPORAN_PUBLIK_STATUS_UPDATE,
      targetType: "laporan_publik",
      targetId: id,
      summary: `Mengubah status laporan publik dari ${before.status} ke ${updated.status}`,
      meta: { fromStatus: before.status, toStatus: updated.status },
    });
  }

  return {
    success: true,
    data: updated,
  };
};
export default LaporanPublikUpdate;
