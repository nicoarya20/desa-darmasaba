// /api/user/delUser.ts
import { AUDIT_ACTIONS, audit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { denyDeveloperAccountChange, type UserManagerContext } from './guard';

export default async function userDeleteAccount(context: UserManagerContext) {
  const { id } = context.params as { id: string };

  try {
    // 1. Cek user dulu
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return {
        success: false,
        message: 'User tidak ditemukan',
      };
    }

    const forbidden = denyDeveloperAccountChange(context, context.actor, existingUser.roleId);
    if (forbidden) return forbidden;

    // ✅ 2. Hapus SEMUA relasi dalam TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // Hapus UserSession
      const deletedSessions = await tx.userSession.deleteMany({
        where: { userId: id },
      });

      // ✅ Hapus UserMenuAccess
      const deletedMenuAccess = await tx.userMenuAccess.deleteMany({
        where: { userId: id },
      });

      // ✅ Tambahkan relasi lain jika ada (contoh):
      // await tx.userLog.deleteMany({ where: { userId: id } });
      // await tx.userNotification.deleteMany({ where: { userId: id } });
      // await tx.userToken.deleteMany({ where: { userId: id } });

      // Hapus user
      const deletedUser = await tx.user.delete({
        where: { id },
      });

      return {
        user: deletedUser,
        sessionsDeleted: deletedSessions.count,
        menuAccessDeleted: deletedMenuAccess.count,
      };
    });

    await audit({
      actor: context.actor,
      action: AUDIT_ACTIONS.USER_DELETE,
      targetType: 'user',
      targetId: id,
      summary: `Menghapus permanen user ${existingUser.email ?? id}`,
      meta: { roleId: existingUser.roleId },
    });

    return {
      success: true,
      message: `User berhasil dihapus permanen (${result.sessionsDeleted} session, ${result.menuAccessDeleted} menu access)`,
      data: result,
    };
  } catch (error) {
    console.error('Error delete user:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat menghapus user',
    };
  }
}