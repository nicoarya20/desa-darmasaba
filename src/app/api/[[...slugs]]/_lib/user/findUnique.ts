import prisma from '@/lib/prisma';
import { Context } from 'elysia';

export default async function userFindUnique(context: Context) {
  const { id } = context.params as { id: string };

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      return { success: false, message: 'User tidak ditemukan' };
    }

    return {
      success: true,
      message: 'Berhasil mendapatkan user',
      data: user,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Gagal mengambil data user',
    };
  }
}
