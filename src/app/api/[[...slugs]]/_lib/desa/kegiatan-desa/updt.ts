/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";
import {
  parsePembangunanInput,
  resolvePembangunanData,
} from "@/lib/kegiatan-pembangunan";
import {
  adaFotoLama,
  adaPerubahanFoto,
  bentukFotoRespons,
  FOTO_PEMBANGUNAN_INCLUDE,
  FOTO_PEMBANGUNAN_REF_SELECT,
  idBerkasFoto,
  jenisDikirim,
  susunBarisFoto,
} from "@/lib/kegiatan-pembangunan-foto";
import removeReleasedFiles from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";
import { validasiFotoPembangunan } from "./foto-check";

async function kegiatanDesaUpdate(context: Context) {
  const { id } = context.params as { id: string };
  const body = context.body as any;

  const parsed = parsePembangunanInput(body);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }
  const pembangunan = resolvePembangunanData(body.kategoriKegiatanId, parsed.data);

  const foto = await validasiFotoPembangunan(body, body.kategoriKegiatanId);
  if (!foto.ok) {
    context.set.status = 400;
    return { success: false, message: foto.message };
  }

  try {
    // Foto yang dirujuk sebelum update, hanya diambil bila foto bisa berubah (dikirim, atau kategori non-Pembangunan
    // yang mengosongkan foto) supaya update biasa tidak menambah query.
    const berubah = adaPerubahanFoto(foto.data);
    const sebelum = berubah
      ? await prisma.kegiatanDesa.findUnique({ where: { id }, select: FOTO_PEMBANGUNAN_REF_SELECT })
      : null;

    const dataKegiatan = {
      judul: body.judul,
      deskripsiSingkat: body.deskripsiSingkat,
      deskripsiLengkap: body.deskripsiLengkap,
      tanggal: new Date(body.tanggal),
      lokasi: body.lokasi,
      partisipan: Number(body.partisipan) || 0,
      kategoriKegiatanId: body.kategoriKegiatanId,
      imageId: body.imageId || null,
      ...pembangunan,
    };
    const args = {
      where: { id },
      data: dataKegiatan,
      include: { kategoriKegiatan: true, image: true, ...FOTO_PEMBANGUNAN_INCLUDE },
    };

    // Foto = set final per jenis yang dikirim: hapus baris lama jenis itu + buat ulang + update kegiatan dalam satu
    // transaksi. Tanpa foto lama dan tanpa foto baru di jenis itu tidak ada yang perlu diubah → update biasa.
    const jenis = jenisDikirim(foto.data);
    const baris = susunBarisFoto(id, foto.data);
    const data =
      baris.length === 0 && !adaFotoLama(sebelum, jenis)
        ? await prisma.kegiatanDesa.update(args)
        : await prisma.$transaction(async (tx) => {
            await tx.kegiatanDesaFoto.deleteMany({ where: { kegiatanDesaId: id, jenis: { in: jenis } } });
            if (baris.length > 0) await tx.kegiatanDesaFoto.createMany({ data: baris });
            return tx.kegiatanDesa.update(args);
          });

    if (sebelum) {
      await removeReleasedFiles("KegiatanDesa", idBerkasFoto(sebelum), idBerkasFoto(data));
    }

    return { success: true, message: "Kegiatan desa berhasil diupdate", data: bentukFotoRespons(data) };
  } catch (e) {
    console.error("Error di kegiatanDesaUpdate:", e);
    return { success: false, message: "Gagal mengupdate kegiatan desa" };
  }
}

export default kegiatanDesaUpdate;
