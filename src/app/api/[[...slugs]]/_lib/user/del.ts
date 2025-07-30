// /api/user/delete.ts
import prisma from '@/lib/prisma';
import { Context } from 'elysia';

export default async function userDelete(context: Context) {
  const { id } = context.params as { id: string };

  try {
    const deleted = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return {
      success: true,
      message: 'User berhasil dinonaktifkan',
      data: deleted,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Gagal menghapus user',
    };
  }
}
