import prisma from "@/lib/prisma";
import { Context } from "elysia";
import removeReleasedFiles from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";

type ArtikelKesehatanInput = {
  title: string;
  content: string;
  imageId: string;
  introduction: { content: string };
  symptom: { title: string; content: string };
  prevention: { title: string; content: string };
  firstAid: { title: string; content: string };
  mythVsFact: { title: string; mitos: string; fakta: string };
  doctorSign: { content: string };
};

const artikelKesehatanUpdate = async (context: Context) => {
  const id = context.params?.id as string;
  const body = (await context.body) as ArtikelKesehatanInput;

  if (!id) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "ID is required",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const existing = await prisma.artikelKesehatan.findUnique({
    where: { id },
  });

  if (!existing) {
    return new Response(
      JSON.stringify({ success: false, message: "Data not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    title,
    content,
    introduction,
    symptom,
    prevention,
    firstAid,
    mythVsFact,
    doctorSign,
    imageId,
  } = body;

  await Promise.all([
    prisma.introduction.update({
      where: { id: existing.introductionId },
      data: introduction,
    }),
    prisma.symptom.update({
      where: { id: existing.symptomId },
      data: symptom,
    }),
    prisma.prevention.update({
      where: { id: existing.preventionId },
      data: prevention,
    }),
    prisma.firstAid.update({
      where: { id: existing.firstAidId },
      data: firstAid,
    }),
    prisma.mythVsFact.update({
      where: { id: existing.mythVsFactId },
      data: mythVsFact,
    }),
    prisma.doctorSign.update({
      where: { id: existing.doctorSignId },
      data: doctorSign,
    }),
  ]);

  const updated = await prisma.artikelKesehatan.update({
    where: { id },
    data: {
      title,
      content,
      imageId,
    },
    include: {
      introduction: true,
      symptom: true,
      prevention: true,
      firstaid: true,
      mythvsfact: true,
      doctorsign: true,
      image: true,
    },
  });
  await removeReleasedFiles("ArtikelKesehatan", [existing.imageId], [updated.imageId]);

  return {
    status: 200,
    success: true,
    message: "Artikel kesehatan berhasil dihapus",
    data: updated,
  };
};
export default artikelKesehatanUpdate;
