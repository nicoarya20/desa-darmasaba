import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function bentukKonservasiBerdasarkanAdatFindUnique(
  context: Context
) {
  try {
    const id = context?.params?.slugs?.[0];

    // If no ID provided, get the first profile
    if (!id) {
      const data = await prisma.bentukKonservasiBerdasarkanAdat.findFirst();
      return {
        success: true,
        data,
      };
    }

    const data = await prisma.bentukKonservasiBerdasarkanAdat.findUniqueOrThrow(
      {
        where: { id },
      }
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching bentuk konservasi berdasarkan adat:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
