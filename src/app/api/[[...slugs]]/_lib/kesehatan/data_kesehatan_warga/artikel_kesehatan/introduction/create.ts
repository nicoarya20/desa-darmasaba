import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";

type FormCreate = Prisma.IntroductionGetPayload<{
  select: {
    content: true;
  };
}>;

export default async function introductionCreate(context: Context) {
  const body = context.body as FormCreate;

  await prisma.introduction.create({
    data: {
      content: body.content,
    },
  });
  return {
    success: true,
    message: "Sukses menambahkan introduction",
    data: {
      ...body,
    },
  };
}