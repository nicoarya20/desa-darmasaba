/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function userUpdate(context: Context) {
  try {
    const { id, isActive } = await context.body as { id: string, isActive: boolean };

    if (!id) {
      return {
        success: false,
        message: "ID user wajib ada",
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        username: true,
        nomor: true,
        isActive: true,
        updatedAt: true,
      }
    });

    return {
      success: true,
      message: `User berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}`,
      data: updatedUser,
    };
  } catch (e: any) {
    console.error("Error update user:", e);
    return {
      success: false,
      message: "Gagal mengupdate status user",
    };
  }
}
