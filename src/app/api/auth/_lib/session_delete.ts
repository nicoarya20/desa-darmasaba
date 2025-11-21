// app/api/auth/_lib/session_delete.ts
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * Hapus session dari database dan cookie
 */
export async function sessionDelete({
  sessionKey,
  userId,
}: {
  sessionKey: string;
  userId?: string;
}): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(sessionKey)?.value;

    // Hapus dari database
    if (token) {
      const deleted = await prisma.userSession.deleteMany({
        where: { token },
      });
      console.log(`🗑️ Deleted ${deleted.count} session(s) by token`);
    } else if (userId) {
      // Fallback: hapus berdasarkan userId
      const deleted = await prisma.userSession.deleteMany({
        where: { userId },
      });
      console.log(`🗑️ Deleted ${deleted.count} session(s) for user ${userId}`);
    }

    // Hapus cookie
    cookieStore.delete(sessionKey);
    console.log('✅ Session deleted successfully');

    return true;
  } catch (error) {
    console.error("❌ Error deleting session:", error);
    return false;
  }
}