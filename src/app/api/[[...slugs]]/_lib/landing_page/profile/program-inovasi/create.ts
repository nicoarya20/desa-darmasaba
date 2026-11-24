import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import {
  susunDataCreate,
  type ProgramInovasiCreateBody,
} from "@/lib/program-inovasi";
import { Context } from "elysia";
import { idGambarSisipan } from "./gambar-sisipan";

export default async function programInovasiCreate(context: Context) {
  const body = context.body as ProgramInovasiCreateBody;

  if (!body.name) {
    throw new Error("name wajib diisi");
  }

  const hasil = susunDataCreate(body);
  if (!hasil.ok) {
    context.set.status = 400;
    return { success: false, message: hasil.message };
  }

  try {
    const sisipan = await idGambarSisipan(body.description);
    if (!sisipan.ok) {
      context.set.status = 400;
      return { success: false, message: sisipan.message };
    }
    const result = await prisma.programInovasi.create({
      data: {
        ...hasil.data,
        ...(sisipan.ids.length > 0
          ? { gambarSisipan: { connect: sisipan.ids.map((id) => ({ id })) } }
          : {}),
      },
      include: {
        image: true,
        images: true,
      },
    });

    return {
      success: true,
      message: "Berhasil membuat program inovasi",
      data: result,
    };
  } catch (error) {
    // Nama unik (@unique) → 409 "Nama sudah dipakai"; error lain di-throw
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("Error creating program inovasi:", error);
    throw new Error(
      "Gagal membuat program inovasi: " + (error as Error).message
    );
  }
}
