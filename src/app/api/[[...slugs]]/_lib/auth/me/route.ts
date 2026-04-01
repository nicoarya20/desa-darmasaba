import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
// Jika pakai custom session (bukan next-auth), ganti dengan logic session-mu

export async function GET(req: NextRequest) {
  // 🔸 GANTI DENGAN LOGIC SESSION-MU
  // Contoh: jika kamu simpan user.id di cookie atau JWT
  const userId = req.cookies.get("hipmi_user_id")?.value; // sesuaikan

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      nomor: true,
      isActive: true,
      role: { select: { name: true } },
    },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ user });
}