import prisma from "@/lib/prisma";
import { DESA_ANTI_KORUPSI_INCLUDE, type DokumenInput } from "@/lib/desa-anti-korupsi-dokumen";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";
import { prepareDokumenSync } from "./dokumen-sync";

type FormCreate = {
  name: string;
  deskripsi: string;
  kategoriId: string; // minimal satu kategori
  dokumen?: DokumenInput[]; // isi folder; boleh kosong
};

export default async function desaAntiKorupsiCreate(context: Context) {
  const body = context.body as FormCreate;

  if (!body.kategoriId) {
    throw new Error("kategoriId wajib diisi");
  }

  // Program baru belum punya dokumen tersimpan → semua dokumen wajib tanpa id.
  const sync = await prepareDokumenSync([], body.dokumen ?? []);
  if (!sync.ok) {
    context.set.status = 400;
    return { success: false, message: sync.message };
  }

  try {
    const result = await prisma.desaAntiKorupsi.create({
      data: {
        name: body.name,
        deskripsi: body.deskripsi,
        kategoriId: body.kategoriId,
        dokumen: { create: sync.plan.create },
      },
      include: DESA_ANTI_KORUPSI_INCLUDE,
    });

    return {
      success: true,
      message: "Berhasil membuat desa anti korupsi",
      data: result,
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
