// app/api/check-update/route.ts
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil berita terbaru
    const latestBerita = await prisma.berita.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    // Ambil pengumuman terbaru
    const latestPengumuman = await prisma.pengumuman.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    return Response.json({
      success: true,
      data: {
        berita: latestBerita
          ? { id: latestBerita.id, createdAt: latestBerita.createdAt.toISOString() }
          : null,
        pengumuman: latestPengumuman
          ? { id: latestPengumuman.id, createdAt: latestPengumuman.createdAt.toISOString() }
          : null,
      },
    });
  } catch (error) {
    console.error("Error in /api/check-update:", error);
    return Response.json(
      { success: false, message: "Gagal cek update" },
      { status: 500 }
    );
  }
}