import prisma from "@/lib/prisma";
import { JenisKelaminBalita, StatusStunting } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  nik?: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelaminBalita;
  beratBadanKg?: number;
  tinggiBadanCm?: number;
  namaOrtu?: string;
  alamat?: string;
  noHpOrtu?: string;
  posyanduId?: string;
  imunisasiLengkap: boolean;
  giziBaik: boolean;
  pemeriksaanRutin: boolean;
  statusStunting: StatusStunting;
  catatan?: string;
};

export default async function balitaCreate(context: Context) {
  const body = context.body as FormCreate;

  const data = await prisma.balita.create({
    data: {
      nama: body.nama,
      nik: body.nik,
      tanggalLahir: new Date(body.tanggalLahir),
      jenisKelamin: body.jenisKelamin,
      beratBadanKg: body.beratBadanKg,
      tinggiBadanCm: body.tinggiBadanCm,
      namaOrtu: body.namaOrtu,
      alamat: body.alamat,
      noHpOrtu: body.noHpOrtu,
      posyanduId: body.posyanduId || null,
      imunisasiLengkap: body.imunisasiLengkap,
      giziBaik: body.giziBaik,
      pemeriksaanRutin: body.pemeriksaanRutin,
      statusStunting: body.statusStunting ?? "NORMAL",
      catatan: body.catatan,
    },
  });

  return { success: true, message: "Balita berhasil ditambahkan", data };
}
