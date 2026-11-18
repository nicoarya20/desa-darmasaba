/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";
import {
  parsePembangunanInput,
  resolvePembangunanData,
} from "@/lib/kegiatan-pembangunan";
import {
  bentukFotoRespons,
  FOTO_PEMBANGUNAN_INCLUDE,
  susunDataFotoCreate,
} from "@/lib/kegiatan-pembangunan-foto";
import { validasiFotoPembangunan } from "./foto-check";

async function kegiatanDesaCreate(context: Context) {
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
    const data = await prisma.kegiatanDesa.create({
      data: {
        judul: body.judul,
        deskripsiSingkat: body.deskripsiSingkat,
        deskripsiLengkap: body.deskripsiLengkap,
        tanggal: new Date(body.tanggal),
        lokasi: body.lokasi,
        partisipan: Number(body.partisipan) || 0,
        kategoriKegiatanId: body.kategoriKegiatanId,
        imageId: body.imageId || null,
        ...pembangunan,
        ...susunDataFotoCreate(foto.data),
      },
      include: { kategoriKegiatan: true, image: true, ...FOTO_PEMBANGUNAN_INCLUDE },
    });

    return { success: true, message: "Kegiatan desa berhasil dibuat", data: bentukFotoRespons(data) };
  } catch (e) {
    console.error("Error di kegiatanDesaCreate:", e);
    return { success: false, message: "Gagal membuat kegiatan desa" };
  }
}

export default kegiatanDesaCreate;
