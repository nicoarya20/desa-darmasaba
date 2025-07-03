import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormUpdate = {
  nama: string;
  deskripsi: string;
  ikonUrl?: string;
  statistik?: {
    tahun: number;
    jumlah: number;
  };
};

export default async function programKemiskinanUpdate(context: Context) {
  const id = context.params.id as string;
  const body = context.body as FormUpdate;

  try {
    // cari ID statistik yang terkait
    const existing = await prisma.programKemiskinan.findUnique({
      where: { id },
      include: { statistik: true },
    });

    if (!existing) {
      return new Response(JSON.stringify({ success: false, message: "Program tidak ditemukan" }), { status: 404 });
    }

    // update statistik (bisa update atau create kalau belum ada)
    let statistikUpdate;

    if (existing.statistikId) {
      statistikUpdate = await prisma.statistikKemiskinan.update({
        where: { id: existing.statistikId },
        data: {
          tahun: Number(body.statistik?.tahun),
          jumlah: Number(body.statistik?.jumlah),
        },
      });
    } else {
      statistikUpdate = await prisma.statistikKemiskinan.create({
        data: {
          tahun: Number(body.statistik?.tahun),
          jumlah: Number(body.statistik?.jumlah),
        },
      });
    }

    const program = await prisma.programKemiskinan.update({
      where: { id },
      data: {
        nama: body.nama,
        deskripsi: body.deskripsi,
        ikonUrl: body.ikonUrl,
        statistik: {
          connect: { id: statistikUpdate.id }, // konek ke statistik baru atau yang diperbarui
        },
      },
      include: { statistik: true },
    });

    return new Response(JSON.stringify({ success: true, data: program }), {
      status: 200,
    });
  } catch (err) {
    console.error("Gagal update:", err);
    return new Response(JSON.stringify({ success: false, message: "Gagal update program" }), {
      status: 500,
    });
  }
}
