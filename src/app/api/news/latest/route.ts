// app/api/news/latest/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const berita = await prisma.berita.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { kategoriBerita: true },
    });

    const pengumuman = await prisma.pengumuman.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { CategoryPengumuman: true },
    });

    const news = [
      ...berita.map((b) => ({
        id: b.id,
        type: "berita" as const,
        title: b.judul,
        content: b.content,
        timestamp: b.createdAt,
        kategoriBerita: b.kategoriBerita || undefined,
      })),
      ...pengumuman.map((p) => ({
        id: p.id,
        type: "pengumuman" as const,
        title: p.judul,
        content: p.content,
        timestamp: p.createdAt,
        kategoriPengumuman: p.CategoryPengumuman || undefined,
      })),
    ];

    return NextResponse.json({ success: true, news }); // ✅ ganti 'data' jadi 'news'
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat data" }, { status: 500 });
  }
}