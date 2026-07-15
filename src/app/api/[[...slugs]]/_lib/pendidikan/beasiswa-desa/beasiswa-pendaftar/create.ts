import prisma from "@/lib/prisma";
import { toDuplicateResponse } from "@/lib/prisma-error";
import { Context } from "elysia";

type FormCreate = {
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

export default async function beasiswaPendaftarCreate(context: Context) {
  const body = (await context.body) as FormCreate;

  try {
    const result = await prisma.beasiswaPendaftar.create({
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

    return {
      success: true,
      message: "Berhasil membuat data pendaftar beasiswa",
      data: result,
    };
  } catch (error) {
    // NIK pendaftar unik (@unique) → 409 "NIK sudah dipakai"; error lain di-throw
    const duplicate = toDuplicateResponse(error);
    if (duplicate) {
      context.set.status = 409;
      return duplicate;
    }
    console.error("Gagal membuat data beasiswa pendaftar:", error);
    throw new Error("Gagal membuat data beasiswa pendaftar: " + (error as Error).message);
  }
}
