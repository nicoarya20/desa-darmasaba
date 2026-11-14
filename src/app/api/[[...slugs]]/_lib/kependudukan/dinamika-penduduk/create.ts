import prisma from "@/lib/prisma";
import type { DinamikaInput } from "@/lib/dinamika-penduduk";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

/** Tambah dinamika satu tahun; tahun yang sudah ada → 409 "Tahun sudah dipakai". */
export default async function dinamikaPendudukCreate(context: Context) {
  const { tahun, kelahiran, kematian, masuk, keluar } = context.body as DinamikaInput;

  try {
    const data = await prisma.dinamikaPenduduk.create({
      data: { tahun, kelahiran, kematian, masuk, keluar },
    });
    return { success: true, message: "Berhasil menambahkan data dinamika penduduk", data };
  } catch (error) {
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    throw new Error(`Gagal menambahkan dinamika penduduk tahun ${tahun}: ${(error as Error).message}`);
  }
}
