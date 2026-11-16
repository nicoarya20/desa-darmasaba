import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";
import { bacaStatistik, buatSlugProgram } from "./program.body";

type FormCreate = {
  nama: string;
  deskripsi: string;
  icon: string;
  statistik?: {
    tahun: string;
    jumlah: string;
  };
};

export default async function programKemiskinanCreate(context: Context) {
  const body = context.body as FormCreate;

  const statistik = bacaStatistik(body.statistik);

  try {
    const program = await prisma.programKemiskinan.create({
      data: {
        nama: body.nama,
        slug: await buatSlugProgram(body.nama),
        deskripsi: body.deskripsi,
        icon: body.icon,
        statistik: statistik ? { create: statistik } : undefined,
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
