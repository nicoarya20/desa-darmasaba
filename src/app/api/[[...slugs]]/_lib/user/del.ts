// /api/user/delete.ts
import prisma from '@/lib/prisma';
import { denyDeveloperAccountChange, type UserManagerContext } from './guard';

export default async function userDelete(context: UserManagerContext) {
  const { id } = context.params as { id: string };

  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { roleId: true } });
    const forbidden = denyDeveloperAccountChange(context, context.actor, target?.roleId);
    if (forbidden) return forbidden;

    const deleted = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    await prisma.session.deleteMany({ where: { userId: id } });

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
