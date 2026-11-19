import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { parseProdukHukumInput } from "@/lib/produk-hukum";
import { rejectUnknownPpidFile } from "../../ppid/ppid-file";
import { PESAN_ADMIN_PRODUK_HUKUM } from "./produk-hukum.guard";
import { PRODUK_HUKUM_AKTIF, PRODUK_HUKUM_SELECT } from "./find-many";

/** POST (admin) tambah produk hukum: `judul`, `kategori` wajib; `nomor`, `tahun`, `fileId` (PDF) opsional; `urutan` otomatis = terakhir + 1. */
export default async function produkHukumCreate(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_PRODUK_HUKUM);
  if (denied) return denied;

  const parsed = parseProdukHukumInput(context.body as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }
  const { fileId, ...fields } = parsed.data;
  const unknownFile = await rejectUnknownPpidFile(context.set, fileId);
  if (unknownFile) return unknownFile;

  const last = await prisma.produkHukum.aggregate({ where: PRODUK_HUKUM_AKTIF, _max: { urutan: true } });
  const data = await prisma.produkHukum.create({
    data: { ...fields, fileId: fileId ?? null, urutan: (last._max.urutan ?? -1) + 1 },
    select: PRODUK_HUKUM_SELECT,
  });
  return { success: true, message: "Produk hukum berhasil ditambahkan", data };
}
