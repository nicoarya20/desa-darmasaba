import prisma from "@/lib/prisma";
import { IbuHamilStatus } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = {
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

export default async function ibuHamilUpdate(context: Context) {
  const id = context.params?.id as string;
  const body = context.body as FormUpdate;

  if (!id) {
    return new Response(JSON.stringify({ success: false, message: "ID tidak boleh kosong" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const existing = await prisma.ibuHamil.findUnique({ where: { id } });
    if (!existing) {
      return new Response(JSON.stringify({ success: false, message: "Data tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updated = await prisma.ibuHamil.update({
      where: { id },
      data: {
        nama: body.nama,
        nik: body.nik,
        usiaKehamilan: body.usiaKehamilan ?? 0,
        hpht: body.hpht ? new Date(body.hpht) : null,
        taksiranLahir: body.taksiranLahir ? new Date(body.taksiranLahir) : null,
        alamat: body.alamat,
        noHp: body.noHp,
        catatan: body.catatan,
        posyanduId: body.posyanduId || null,
        status: body.status,
      },
    });

    return new Response(JSON.stringify({ success: true, message: "Ibu hamil berhasil diperbarui", data: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ibuHamilUpdate error:", error);
    return new Response(JSON.stringify({ success: false, message: "Gagal memperbarui data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
