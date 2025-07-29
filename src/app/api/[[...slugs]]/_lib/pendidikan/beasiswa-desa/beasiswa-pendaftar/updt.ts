import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
  namaLengkap: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string; // ISO date string
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  kewarganegaraan: string;
  agama:
    | "ISLAM"
    | "KRISTEN_PROTESTAN"
    | "KRISTEN_KATOLIK"
    | "HINDU"
    | "BUDDHA"
    | "KONGHUCU"
    | "LAINNYA";
  alamatKTP: string;
  alamatDomisili?: string;
  noHp: string;
  email: string;
  statusPernikahan: "BELUM_MENIKAH" | "MENIKAH" | "JANDA_DUDA";
  ukuranBaju?: "S" | "M" | "L" | "XL" | "XXL" | "LAINNYA";
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
        nik: body.nik,
        tempatLahir: body.tempatLahir,
        tanggalLahir: new Date(body.tanggalLahir),
        jenisKelamin: body.jenisKelamin,
        kewarganegaraan: body.kewarganegaraan,
        agama: body.agama,
        alamatKTP: body.alamatKTP,
        alamatDomisili: body.alamatDomisili,
        noHp: body.noHp,
        email: body.email,
        statusPernikahan: body.statusPernikahan,
        ukuranBaju: body.ukuranBaju,
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
    console.error("Update by ID error:", error);
    return {
      success: false,
      message:
        "Gagal mengupdate data: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
