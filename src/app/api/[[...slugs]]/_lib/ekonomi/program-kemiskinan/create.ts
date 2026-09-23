import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormCreate = {
  nama: string;
  deskripsi: string;
  icon: string;
  statistik?: {
    tahun: number;
    jumlah: number;
  };
};

export default async function programKemiskinanCreate(context: Context) {
  const body = context.body as FormCreate;

  try {
    const program = await prisma.programKemiskinan.create({
      data: {
        nama: body.nama,
        deskripsi: body.deskripsi,
        icon: body.icon,
        statistik: body.statistik
          ? {
              create: {
                tahun: Number(body.statistik.tahun),
                jumlah: Number(body.statistik.jumlah),
              },
            }
          : undefined,
      },
      include: {
        statistik: true,
      },
    });

    return {
      success: true,
      message: "Sukses menambahkan program kemiskinan dengan relasi statistik",
      data: program,
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Data statistik untuk tahun ${body.statistik?.tahun ?? ""} sudah ada. Gunakan tahun yang berbeda.`,
        }),
        { status: 409 }
      );
    }
    throw err;
  }
}
