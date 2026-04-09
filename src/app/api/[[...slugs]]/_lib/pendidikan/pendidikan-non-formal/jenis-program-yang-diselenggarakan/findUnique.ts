import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function jenisProgramYangDiselenggarakanFindUnique(
  context: Context
) {
  try {
    const id = context?.params?.slugs?.[0];

    // If no ID provided, get the first profile
    if (!id) {
      const data = await prisma.jenisProgramYangDiselenggarakan.findFirst();
      return {
        success: true,
        data,
      };
    }

    const data = await prisma.jenisProgramYangDiselenggarakan.findUniqueOrThrow(
      {
        where: { id },
      }
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching jenis program yang diselenggarakan:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
