import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function visimisiPPIDFindById(context: Context) {
    try {
        const id = context?.params?.slugs?.[0];
    
        // If no ID provided, get the first profile
        if (!id) {
          const data = await prisma.visiMisiPPID.findFirst();
          return {
            success: true,
            data,
          };
        }
    
        const data = await prisma.visiMisiPPID.findUniqueOrThrow({
          where: { id },
        });
    
        return {
          success: true,
          data,
        };
      } catch (error) {
        console.error("Error fetching visiPPID:", error);
    
        return {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
}
