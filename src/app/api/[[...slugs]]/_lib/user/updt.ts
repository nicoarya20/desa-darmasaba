/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function userUpdate(context: Context) {
  try {
    const { id, isActive, roleId } = await context.body as {
      id: string,
      isActive?: boolean,
      roleId?: string
    };

    if (!id) {
      return {
        success: false,
        message: "ID user wajib ada",
      };
    }

    // Optional: cek apakah roleId valid
    if (roleId) {
      const cekRole = await prisma.role.findUnique({
        where: { id: roleId }
      });

      if (!cekRole) {
        return {
          success: false,
          message: "Role tidak ditemukan",
        };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(roleId && { roleId }),
      },
      select: {
        id: true,
        username: true,
        nomor: true,
        isActive: true,
        roleId: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return {
      success: true,
      message: `User berhasil diupdate`,
      data: updatedUser,
    };

  } catch (e: any) {
    console.error("Error update user:", e);
    return {
      success: false,
      message: "Gagal mengupdate user",
    };
  }
}
