/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import type { DokumenInput } from "@/lib/desa-anti-korupsi-dokumen";
import type { FolderInput } from "@/lib/desa-anti-korupsi-folder";
import { DESA_ANTI_KORUPSI_DETAIL_INCLUDE, toProgramDetail } from "@/lib/desa-anti-korupsi-view";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";
import { applyProgramSync, prepareProgramSync } from "./dokumen-sync";

type FormUpdateDesaAntiKorupsi = {
  name?: string;
  deskripsi?: string;
  kategoriId?: string; // minimal satu kategori
  // undefined = folder tidak diubah; array = set folder final (yang hilang dihapus, dokumennya ke "Umum")
  folders?: FolderInput[];
  // undefined = dokumen tidak diubah; array = set dokumen final (sinkronisasi penuh)
  dokumen?: DokumenInput[];
};

/** Admin: ubah program; bila `folders`/`dokumen` dikirim, isinya disinkronkan dalam satu transaksi. */
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
    if (body.folders === undefined && body.dokumen === undefined) {
      updated = await prisma.desaAntiKorupsi.update({
        where: { id },
        data: fields,
        include: DESA_ANTI_KORUPSI_DETAIL_INCLUDE,
      });
    } else {
      const sync = await prepareProgramSync(id, { folders: body.folders, dokumen: body.dokumen });
      if (!sync.ok) {
        context.set.status = 400;
        return { success: false, message: sync.message };
      }
      const { plan } = sync;

      // Satu transaksi: field program, folder (buat/ubah/hapus → dokumen ke "Umum"), lalu dokumen;
      // hasil akhir dibaca ulang dengan include detail (isi folder final).
      updated = await prisma.$transaction(async (tx) => {
        await tx.desaAntiKorupsi.update({ where: { id }, data: fields });
        await applyProgramSync(tx, id, plan);
        return tx.desaAntiKorupsi.findUniqueOrThrow({
          where: { id },
          include: DESA_ANTI_KORUPSI_DETAIL_INCLUDE,
        });
      });
    }

    return {
      success: true,
      message: "Desa anti korupsi berhasil diperbarui",
      data: toProgramDetail(updated),
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
