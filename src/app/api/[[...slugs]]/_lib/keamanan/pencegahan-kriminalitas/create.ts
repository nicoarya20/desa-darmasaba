import prisma from "@/lib/prisma";
import { Context } from "elysia";

type ProgramKeamananInput = {
  nama: string;
  deskripsi: string;
  slug: string;
};

type TipsKeamanan = {
  judul: string;
  konten: string;
  slug: string;
};

type VideoKeamanan = {
  judul: string;
  deskripsi: string;
  videoUrl: string;
  slug: string;
};

type createdPencegahanKriminalitas = {
  programKeamanan: ProgramKeamananInput;
  tipsKeamanan: TipsKeamanan;
  videoKeamanan: VideoKeamanan;
};

const pencegahanKriminalitasCreate = async (context: Context) => {
  const { programKeamanan, tipsKeamanan, videoKeamanan } =
    (await context.body) as createdPencegahanKriminalitas;

  const createdProgram = await prisma.programKeamanan.create({
    data: {
      nama: programKeamanan.nama,
      deskripsi: programKeamanan.deskripsi,
      slug: programKeamanan.slug,
    },
  });

  const createdTips = await prisma.tipsKeamanan.create({
    data: {
      judul: tipsKeamanan.judul,
      konten: tipsKeamanan.konten,
      slug: tipsKeamanan.slug,
    },
  });

  const createdVideo = await prisma.videoKeamanan.create({
    data: {
      judul: videoKeamanan.judul,
      deskripsi: videoKeamanan.deskripsi,
      videoUrl: videoKeamanan.videoUrl,
      slug: videoKeamanan.slug,
    },
  });

  const createdPencegahanKriminalitas =
    await prisma.pencegahanKriminalitas.create({
      data: {
        programKeamananId: createdProgram.id,
        tipsKeamananId: createdTips.id,
        videoKeamananId: createdVideo.id,
      },
      include: {
        programKeamanan: true,
        tipsKeamanan: true,
        videoKeamanan: true,
      },
    });

  return Response.json(
    {
      success: true,
      message: "Success create program keamanan",
      data: createdPencegahanKriminalitas,
    },
    { status: 200 }
  );
};
export default pencegahanKriminalitasCreate;
