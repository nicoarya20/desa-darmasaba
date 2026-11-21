import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { rejectUnknownPpidFile } from "../ppid-file";
import { DAFTAR_INFORMASI_INCLUDE } from "./include";

type FormEdit = {
  jenisInformasi: string;
  deskripsi: string;
  tanggal: string;
  fileId?: string | null;
  /** Gambar pendukung: tidak dikirim = dibiarkan, id baru = diganti, null = dilepas. */
  gambarId?: string | null;
};

export default async function daftarInformasiPublikEdit(context: Context) {
  const id = context.params?.id;

  if (!id) {
    return {
      success: false,
      message: "ID tidak ditemukan",
    };
  }

  const body = context.body as FormEdit;

  const unknownFile = await rejectUnknownPpidFile(context.set, body.fileId);
  if (unknownFile) return unknownFile;
  const unknownGambar = await rejectUnknownPpidFile(context.set, body.gambarId);
  if (unknownGambar) return unknownGambar;

  const existing = await prisma.daftarInformasiPublik.findUnique({
    where: {
      id: id,
    },
  });

  if (!existing) {
    return {
      success: false,
      message: "Data tidak ditemukan",
    };
  }

  const updated = await prisma.daftarInformasiPublik.update({
    where: { id },
    data: {
      jenisInformasi: body.jenisInformasi,
      deskripsi: body.deskripsi,
      tanggal: new Date(body.tanggal),
      ...(body.fileId ? { fileId: body.fileId } : {}),
      ...(body.gambarId !== undefined ? { gambarId: body.gambarId } : {}),
    },
    include: DAFTAR_INFORMASI_INCLUDE,
  });

  // Berkas lama dihapus permanen SETELAH relasi dipindah ke berkas baru (bukan sebelumnya: pola bug Maskot).
  if (existing.fileId && body.fileId && existing.fileId !== body.fileId) {
    await removeStoredFile({ id: existing.fileId }, "DaftarInformasiPublik");
  }

  // Gambar lama dihapus permanen SETELAH relasi dipindah/dilepas, sama seperti berkas PDF.
  if (existing.gambarId && body.gambarId !== undefined && existing.gambarId !== body.gambarId) {
    await removeStoredFile({ id: existing.gambarId }, "DaftarInformasiPublik");
  }

  return {
    success: true,
    message: "Data berhasil diupdate",
    data: updated,
  };
}
