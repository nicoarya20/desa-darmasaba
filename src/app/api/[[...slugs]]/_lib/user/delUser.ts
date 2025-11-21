// /api/user/delete.ts
import prisma from '@/lib/prisma';
import { Context } from 'elysia';

export default async function userDelete(context: Context) {
  const { id } = context.params as { id: string };

  try {
    // Cek user dulu
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return {
        success: false,
        message: 'User tidak ditemukan',
      };
    }

    // Hard delete (hapus permanen)
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'User berhasil dihapus permanen',
      data: deletedUser,
    };
  } catch (error) {
    console.error('Error delete user:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat menghapus user',
    };
  }
}
