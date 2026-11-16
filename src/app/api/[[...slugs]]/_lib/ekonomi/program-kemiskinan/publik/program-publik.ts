import prisma from "@/lib/prisma";
import { jumlahPerTahun } from "@/lib/program-kemiskinan/penerima-rekap";
import type { Context } from "elysia";

/** Program aktif berdasarkan slug atau id (URL publik memakai slug bila ada); null = tidak ada/nonaktif. */
export async function cariProgramPublik(key: string) {
  const k = key.trim();
  if (!k) return null;
  return prisma.programKemiskinan.findFirst({
    where: { isActive: true, OR: [{ slug: k }, { id: k }] },
    select: { id: true, slug: true, nama: true, deskripsi: true, icon: true },
  });
}

/** Balasan 404 seragam untuk program publik yang tidak ditemukan. */
export function programTidakAda(set: Context["set"]) {
  set.status = 404;
  return { success: false as const, message: "Program tidak ditemukan" };
}

/**
 * GET /publik/:key — detail program untuk halaman publik + jumlah penerima aktif per tahun (terbaru
 * dulu). Tidak mengirim daftar nama; itu lewat `/publik/:key/penerima` yang berpaginasi.
 */
export default async function programKemiskinanPublik(context: Context) {
  const program = await cariProgramPublik(String(context.params?.key ?? ""));
  if (!program) return programTidakAda(context.set);
  const grup = await prisma.penerimaProgramKemiskinan.groupBy({
    by: ["tahun"],
    where: { programId: program.id, isActive: true },
    _count: { _all: true },
  });
  return { success: true as const, data: { ...program, tahun: jumlahPerTahun(grup) } };
}
