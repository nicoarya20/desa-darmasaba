import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  namaLengkap: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string; // ISO date string
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  kewarganegaraan: string;
  agama: "ISLAM" | "KRISTEN_PROTESTAN" | "KRISTEN_KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" | "LAINNYA";
  alamatKTP: string;
  alamatDomisili?: string;
  noHp: string;
  email: string;
  statusPernikahan: "BELUM_MENIKAH" | "MENIKAH" | "JANDA_DUDA";
  ukuranBaju?: "S" | "M" | "L" | "XL" | "XXL" | "LAINNYA";
};

export default async function beasiswaPendaftarCreate(context: Context) {
  const body = (await context.body) as FormCreate;

  try {
    const result = await prisma.beasiswaPendaftar.create({
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

    return {
      success: true,
      message: "Berhasil membuat data pendaftar beasiswa",
      data: result,
    };
  } catch (error) {
    console.error("Gagal membuat data beasiswa pendaftar:", error);
    throw new Error("Gagal membuat data beasiswa pendaftar: " + (error as Error).message);
  }
}
