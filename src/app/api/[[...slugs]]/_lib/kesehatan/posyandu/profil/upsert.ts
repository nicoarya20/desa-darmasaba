import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { sanitizeRichTextForStorage } from "@/lib/rich-text-server";
import {
  PROFIL_POSYANDU_ID,
  profilPosyanduBodySchema,
  urutanKlaster,
  type KlasterPosyanduBody,
} from "@/lib/posyandu/posyandu-konten.validation";
import removeReleasedFiles from "../../../fileStorage/_lib/removeReleasedFiles";
import { validationFailure, writeFailure } from "../../../_struktur-organisasi/http";
import { KLASTER_FILE_OWNER, muatProfilPosyandu } from "./profil.data";

/** Operasi upsert satu klaster per `sasaran` (unik); `imageId` undefined = gambar dibiarkan. */
function upsertKlaster(k: KlasterPosyanduBody) {
  const isi = { judul: k.judul, deskripsi: k.deskripsi, jamPelayanan: k.jamPelayanan };
  return prisma.klasterPosyandu.upsert({
    where: { sasaran: k.sasaran },
    create: { sasaran: k.sasaran, ...isi, imageId: k.imageId ?? null, urutan: urutanKlaster(k.sasaran) },
    update: { ...isi, ...(k.imageId !== undefined && { imageId: k.imageId }) },
  });
}

/**
 * PUT (admin): simpan deskripsi umum posyandu (singleton) dan klaster yang dikirim dalam satu transaksi.
 * Teks kaya dibersihkan sebelum disimpan; gambar klaster yang diganti/dilepas dihapus permanen setelahnya.
 */
export default async function profilPosyanduUpsert(context: Context) {
  const parsed = profilPosyanduBodySchema.safeParse(context.body);
  if (!parsed.success) return validationFailure(context, parsed.error);

  const { klaster = [], deskripsi, fungsiKegiatan } = parsed.data;
  const profil = {
    deskripsi: sanitizeRichTextForStorage(deskripsi),
    fungsiKegiatan: fungsiKegiatan ? sanitizeRichTextForStorage(fungsiKegiatan) : null,
  };

  try {
    const lama = klaster.length
      ? await prisma.klasterPosyandu.findMany({
          where: { sasaran: { in: klaster.map((k) => k.sasaran) } },
          select: { sasaran: true, imageId: true },
        })
      : [];

    await prisma.$transaction([
      prisma.profilPosyandu.upsert({
        where: { id: PROFIL_POSYANDU_ID },
        create: { id: PROFIL_POSYANDU_ID, ...profil },
        update: profil,
      }),
      ...klaster.map(upsertKlaster),
    ]);

    const baru = new Map(klaster.map((k) => [k.sasaran, k.imageId]));
    await removeReleasedFiles(
      KLASTER_FILE_OWNER,
      lama.map((l) => l.imageId),
      lama.map((l) => (baru.get(l.sasaran) === undefined ? l.imageId : baru.get(l.sasaran))),
    );

    return { success: true, message: "Profil posyandu berhasil disimpan", data: await muatProfilPosyandu() };
  } catch (error) {
    return writeFailure(error, context);
  }
}
