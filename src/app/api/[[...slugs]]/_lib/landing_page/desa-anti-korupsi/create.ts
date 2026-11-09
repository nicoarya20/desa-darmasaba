import prisma from "@/lib/prisma";
import type { DokumenInput } from "@/lib/desa-anti-korupsi-dokumen";
import type { FolderInput } from "@/lib/desa-anti-korupsi-folder";
import { DESA_ANTI_KORUPSI_DETAIL_INCLUDE, toProgramDetail } from "@/lib/desa-anti-korupsi-view";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";
import { applyProgramSync, prepareProgramSync } from "./dokumen-sync";

type FormCreate = {
  name: string;
  deskripsi: string;
  kategoriId: string; // minimal satu kategori
  folders?: FolderInput[]; // folder baru (tempKey); boleh kosong
  dokumen?: DokumenInput[]; // isi program; boleh kosong
};

/** Admin: buat program beserta folder + dokumennya dalam satu transaksi. */
export default async function desaAntiKorupsiCreate(context: Context) {
  const body = context.body as FormCreate;

  if (!body.kategoriId) {
    throw new Error("kategoriId wajib diisi");
  }

  // Program baru belum punya isi tersimpan → folder wajib tempKey, dokumen wajib tanpa id.
  const sync = await prepareProgramSync(null, { folders: body.folders, dokumen: body.dokumen });
  if (!sync.ok) {
    context.set.status = 400;
    return { success: false, message: sync.message };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const program = await tx.desaAntiKorupsi.create({
        data: { name: body.name, deskripsi: body.deskripsi, kategoriId: body.kategoriId },
        select: { id: true },
      });
      await applyProgramSync(tx, program.id, sync.plan);
      return tx.desaAntiKorupsi.findUniqueOrThrow({
        where: { id: program.id },
        include: DESA_ANTI_KORUPSI_DETAIL_INCLUDE,
      });
    });

    return {
      success: true,
      message: "Berhasil membuat desa anti korupsi",
      data: toProgramDetail(result),
    };
  } catch (error) {
    // Nama unik (@unique) → 409 "Nama sudah dipakai"; error lain di-throw
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("Error creating desa anti korupsi:", error);
    throw new Error(
      "Gagal membuat desa anti korupsi: " + (error as Error).message
    );
  }
}
