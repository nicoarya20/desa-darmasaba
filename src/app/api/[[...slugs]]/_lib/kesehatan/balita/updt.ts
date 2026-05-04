import prisma from "@/lib/prisma";
import { JenisKelaminBalita, StatusStunting } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = {
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

export default async function balitaUpdate(context: Context) {
  const id = context.params?.id as string;
  const body = context.body as FormUpdate;

  if (!id) {
    return new Response(JSON.stringify({ success: false, message: "ID tidak boleh kosong" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const existing = await prisma.balita.findUnique({ where: { id } });
    if (!existing) {
      return new Response(JSON.stringify({ success: false, message: "Data tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updated = await prisma.balita.update({
      where: { id },
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
        statusStunting: body.statusStunting,
        catatan: body.catatan,
      },
    });

    return new Response(JSON.stringify({ success: true, message: "Balita berhasil diperbarui", data: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("balitaUpdate error:", error);
    return new Response(JSON.stringify({ success: false, message: "Gagal memperbarui data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
