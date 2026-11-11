import prisma from "@/lib/prisma";
import { susunBeritaCreate, type BeritaBody } from "@/lib/berita-data";
import { parseTanggalTerbit } from "@/lib/tanggal-terbit";
import { Context } from "elysia";

/** Buat berita; `tanggalTerbit` kosong = sekarang, tidak valid = 400 sebelum menyentuh DB. */
async function beritaCreate(context: Context) {
  const body = context.body as BeritaBody;

  const tanggal = parseTanggalTerbit(body.tanggalTerbit);
  if (!tanggal.ok) {
    context.set.status = 400;
    return { success: false, message: tanggal.message };
  }

  const created = await prisma.berita.create({
    data: susunBeritaCreate(body, tanggal.data),
    select: { id: true, tanggalTerbit: true },
  });

  return {
    success: true,
    message: "Sukses menambahkan berita",
    data: {
      ...body,
      ...created,
    },
  };
}

export default beritaCreate
