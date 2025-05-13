import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function profilePPIDFindById(context: Context) {
  try {
    const id = context?.params?.slugs?.[0];

    // If no ID provided, get the first profile
    if (!id) {
      const data = await prisma.profilePPID.findFirst();
      return {
        success: true,
        data,
      };
    }

    const data = await prisma.profilePPID.findUniqueOrThrow({
      where: { id },
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching profilePPID:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
