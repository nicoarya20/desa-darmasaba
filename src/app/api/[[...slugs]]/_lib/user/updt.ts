/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { Context } from "elysia";

// API update user
export default async function userUpdate(context: Context) {
  try {
    const { id, isActive, roleId } = (await context.body) as {
      id: string;
      isActive?: boolean;
      roleId?: string;
    };

    if (!id) {
      return { success: false, message: "ID user wajib ada" };
    }

    // Validasi role
    if (roleId) {
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) return { success: false, message: "Role tidak ditemukan" };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { roleId: true, isActive: true }
    });

    if (!currentUser) {
      return { success: false, message: "User tidak ditemukan" };
    }

    const isRoleChanged = roleId && currentUser.roleId !== roleId;
    const isActiveChanged = isActive !== undefined && currentUser.isActive !== isActive;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(roleId && { roleId }),
        // Force logout: invalidate semua sesi
        ...(isRoleChanged ? { sessionInvalid: true } : {}),
      },
      select: {
        id: true,
        username: true,
        nomor: true,
        isActive: true,
        roleId: true,
        role: { select: { name: true } }
      }
    });

    // ✅ HAPUS SEMUA SESI USER DI DATABASE
    if (isRoleChanged) {
      await prisma.userSession.deleteMany({ where: { userId: id } });
    }

    return {
      success: true,
      roleChanged: isRoleChanged,
      isActiveChanged,
      data: updatedUser,
      message: isRoleChanged 
        ? `Role ${updatedUser.username} diubah. User akan logout otomatis.`
        : isActiveChanged
        ? `${updatedUser.username} ${isActive ? 'diaktifkan' : 'dinonaktifkan'}.`
        : "User berhasil diupdate"
    };
  } catch (e: any) {
    console.error("❌ Error update user:", e);
    return {
      success: false,
      message: "Gagal mengupdate user: " + (e.message || "Unknown error"),
    };
  }
}