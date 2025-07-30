// /api/user/update.ts
import prisma from '@/lib/prisma';
import { Context } from 'elysia';

export default async function userUpdate(context: Context) {
  const { id } = context.params as { id: string };
  const body = await context.body as {
    nama?: string;
    email?: string;
    password?: string;
    roleId?: string;
    isActive?: boolean;
  };

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...body,
      },
    });

    return {
      success: true,
      message: 'User berhasil diupdate',
      data: updated,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Gagal mengupdate user',
    };
  }
}
