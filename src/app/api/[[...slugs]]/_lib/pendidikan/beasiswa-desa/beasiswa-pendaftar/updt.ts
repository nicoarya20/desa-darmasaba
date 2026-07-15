import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormUpdate = {
  namaLengkap: string;
  nis: string;
  kelas: string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  alamatDomisili?: string;
  tempatLahir: string;
  tanggalLahir: string; // ISO date string
  namaOrtu?: string;
  nik: string;
  pekerjaanOrtu?: string;
  penghasilan?: string;
  noHp: string;
};

export default async function beasiswaPendaftarUpdate(context: Context) {
  const id = context.params.id as string;
  const body = context.body as FormUpdate;

  try {
    if (typeof id !== "string") {
      return {
        success: false,
        message: "ID is required",
      };
    }

    const data = await prisma.beasiswaPendaftar.update({
      where: { id },
      data: {
        namaLengkap: body.namaLengkap,
        nis: body.nis,
        kelas: body.kelas,
        jenisKelamin: body.jenisKelamin,
        alamatDomisili: body.alamatDomisili,
        tempatLahir: body.tempatLahir,
        tanggalLahir: new Date(body.tanggalLahir),
        namaOrtu: body.namaOrtu,
        nik: body.nik,
        pekerjaanOrtu: body.pekerjaanOrtu,
        penghasilan: body.penghasilan,
        noHp: body.noHp,
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Data not found",
      };
    }

    return {
      success: true,
      message: "Success update beasiswa pendaftar",
      data,
    };
  } catch (error) {
    // Ganti NIK ke NIK pendaftar lain yang sudah ada → 409 "NIK sudah dipakai"
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("Update by ID error:", error);
    return {
      success: false,
      message:
        "Gagal mengupdate data: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
