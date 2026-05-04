import prisma from "@/lib/prisma";
import { IbuHamilStatus } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  nik?: string;
  usiaKehamilan: number;
  hpht?: string;
  taksiranLahir?: string;
  alamat?: string;
  noHp?: string;
  catatan?: string;
  posyanduId?: string;
  status: IbuHamilStatus;
};

export default async function ibuHamilCreate(context: Context) {
  const body = context.body as FormCreate;

  const data = await prisma.ibuHamil.create({
    data: {
      nama: body.nama,
      nik: body.nik,
      usiaKehamilan: body.usiaKehamilan ?? 0,
      hpht: body.hpht ? new Date(body.hpht) : undefined,
      taksiranLahir: body.taksiranLahir ? new Date(body.taksiranLahir) : undefined,
      alamat: body.alamat,
      noHp: body.noHp,
      catatan: body.catatan,
      posyanduId: body.posyanduId || null,
      status: body.status ?? "AKTIF",
    },
  });

  return { success: true, message: "Ibu hamil berhasil ditambahkan", data };
}
