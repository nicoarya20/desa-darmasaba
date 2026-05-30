import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  name: string;
};

export default async function banjarCreate(context: Context) {
  const body = (await context.body) as FormCreate;

  try {
    const result = await prisma.banjar.create({
      data: { name: body.name },
    });
    return {
      success: true,
      message: "Berhasil membuat banjar",
      data: result,
    };
  } catch (error) {
    console.error("Error creating banjar:", error);
    throw new Error("Gagal membuat banjar: " + (error as Error).message);
  }
}
