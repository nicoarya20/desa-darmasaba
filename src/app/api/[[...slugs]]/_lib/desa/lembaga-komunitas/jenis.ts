import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { LEMBAGA_KOMUNITAS_JENIS_SUGGEST_MAX } from "@/lib/lembaga-komunitas";
import { LEMBAGA_KOMUNITAS_AKTIF } from "./find-many";

/** GET publik daftar `jenis` yang sudah dipakai lembaga aktif (A-Z, tanpa beda huruf besar-kecil, maks 100); saran isian form admin. */
export default async function lembagaKomunitasJenis(context: Context) {
  try {
    const rows = await prisma.lembagaKomunitas.findMany({
      where: LEMBAGA_KOMUNITAS_AKTIF,
      distinct: ["jenis"],
      orderBy: { jenis: "asc" },
      take: LEMBAGA_KOMUNITAS_JENIS_SUGGEST_MAX,
      select: { jenis: true },
    });
    // `distinct` Postgres peka huruf besar-kecil ("PKK" dan "pkk" dua baris); saran cukup satu per ejaan huruf.
    const seen = new Set<string>();
    const data: string[] = [];
    for (const { jenis } of rows) {
      const kunci = jenis.toLowerCase();
      if (seen.has(kunci)) continue;
      seen.add(kunci);
      data.push(jenis);
    }
    return { success: true, data };
  } catch (error) {
    console.error("Gagal mengambil daftar jenis Lembaga & Komunitas:", error);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil daftar jenis Lembaga & Komunitas" };
  }
}
