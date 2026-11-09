/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { DESA_ANTI_KORUPSI_INCLUDE, type DokumenInput } from "@/lib/desa-anti-korupsi-dokumen";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";
import { prepareDokumenSync } from "./dokumen-sync";

type FormUpdateDesaAntiKorupsi = {
  name?: string;
  deskripsi?: string;
  kategoriId?: string; // minimal satu kategori
  // undefined = isi folder tidak diubah; array = set dokumen final (sinkronisasi penuh)
  dokumen?: DokumenInput[];
};

/** Admin: ubah program; bila `dokumen` dikirim, isi folder disinkronkan (tambah/ubah/hapus). */
export default async function desaAntiKorupsiUpdate(context: Context) {
  const body = context.body as FormUpdateDesaAntiKorupsi;

  const id = context.params.id;

  if (!id) {
    return {
      success: false,
      message: "ID desa anti korupsi wajib diisi",
    };
  }

  const fields = {
    name: body.name,
    deskripsi: body.deskripsi,
    kategoriId: body.kategoriId,
  };

  try {
    let updated;
    if (body.dokumen === undefined) {
      updated = await prisma.desaAntiKorupsi.update({
        where: { id },
        data: fields,
        include: DESA_ANTI_KORUPSI_INCLUDE,
      });
    } else {
      const existing = await prisma.dokumenDesaAntiKorupsi.findMany({
        where: { desaAntiKorupsiId: id, isActive: true },
        select: { id: true, fileId: true, judul: true, urutan: true },
      });
      const sync = await prepareDokumenSync(existing, body.dokumen);
      if (!sync.ok) {
        context.set.status = 400;
        return { success: false, message: sync.message };
      }
      const { plan } = sync;

      // Satu transaksi: dokumen yang dibuang di-soft-delete, judul/urutan diperbarui,
      // lalu program di-update sambil membuat dokumen baru (include = isi folder final).
      updated = await prisma.$transaction(async (tx) => {
        await tx.dokumenDesaAntiKorupsi.updateMany({
          where: { id: { in: plan.remove }, desaAntiKorupsiId: id },
          data: { isActive: false, deletedAt: new Date() },
        });
        await Promise.all(
          plan.update.map((d) =>
            tx.dokumenDesaAntiKorupsi.update({
              where: { id: d.id },
              data: { judul: d.judul, urutan: d.urutan },
            })
          )
        );
        return tx.desaAntiKorupsi.update({
          where: { id },
          data: { ...fields, dokumen: { create: plan.create } },
          include: DESA_ANTI_KORUPSI_INCLUDE,
        });
      });
    }

    return {
      success: true,
      message: "Desa anti korupsi berhasil diperbarui",
      data: updated,
    };
  } catch (error: any) {
    // Ganti nama ke nilai lain yang sudah ada → 409 "Nama sudah dipakai"
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("❌ Error update desa anti korupsi:", error);
    return {
      success: false,
      message: "Gagal memperbarui data desa anti korupsi",
      error: error.message,
    };
  }
}
