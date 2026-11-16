// Bantuan body create/update Program Kemiskinan: statistik opsional dan slug URL publik.
import { slugify } from "@/lib/desa-anti-korupsi-zip";
import prisma from "@/lib/prisma";

type StatistikRaw = { tahun?: unknown; jumlah?: unknown } | undefined;

/** Statistik dari body; tahun & jumlah sama-sama kosong = tidak ada statistik (null). */
export function bacaStatistik(raw: StatistikRaw): { tahun: number; jumlah: number } | null {
  if (!raw) return null;
  const kosong = (v: unknown) => v === undefined || v === null || String(v).trim() === "";
  if (kosong(raw.tahun) && kosong(raw.jumlah)) return null;
  return { tahun: Number(raw.tahun), jumlah: Number(raw.jumlah) };
}

/** Slug unik dari nama program ("PKH (Program Keluarga Harapan)" → "pkh-program-keluarga-harapan"). */
export async function buatSlugProgram(nama: string): Promise<string> {
  const dasar = slugify(nama);
  const dipakai = await prisma.programKemiskinan.findUnique({ where: { slug: dasar }, select: { id: true } });
  return dipakai ? `${dasar}-${Date.now().toString(36)}` : dasar;
}
