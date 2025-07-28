import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function tujuanProgramFindUnique(
  context: Context
) {
  try {
    const id = context?.params?.slugs?.[0];

    // If no ID provided, get the first profile
    if (!id) {
      const data = await prisma.tujuanProgram.findFirst();
      return {
        success: true,
        data,
      };
    }

    const data = await prisma.tujuanProgram.findUniqueOrThrow(
      {
        where: { id },
      }
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching tujuan program:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
