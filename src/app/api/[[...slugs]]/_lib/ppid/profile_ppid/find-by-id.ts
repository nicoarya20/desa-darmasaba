import prisma from "@/lib/prisma";

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];

  if (!id) {
    return Response.json({
      success: false,
      message: "ID tidak boleh kosong",
    }, { status: 400 });
  }

  try {
    if (typeof id !== 'string') {
      return Response.json({
        success: false,
        message: "ID tidak valid",
      }, { status: 400 });
    }

    let data;

    // Special handling for 'edit' - get the first/only record
    if (id === 'edit') {
      data = await prisma.profilePPID.findFirst({
        where: { isActive: true },
        include: {
          image: true,
        },
        orderBy: { createdAt: 'asc' } // Get the oldest one first
      });
    } else {
      data = await prisma.profilePPID.findUnique({
        where: { id },
        include: {
          image: true,
        }
      });
    }

    if (!data) {
      // Untuk ID 'edit', kembalikan pesan khusus karena mungkin memang belum ada data
      if (id === 'edit') {
        return Response.json({
          success: false,
          message: "Belum ada data profil PPID yang aktif",
        }, { status: 404 });
      } else {
        return Response.json({
          success: false,
          message: "Data tidak ditemukan",
        }, { status: 404 });
      }
    }

    return Response.json({
      success: true,
      message: "Berhasil mengambil data berdasarkan ID",
      data,
    }, { status: 200 });
  } catch (e) {
    console.error("Find by ID error:", e);
    return Response.json({
      success: false,
      message: "Gagal mengambil data: " + (e instanceof Error ? e.message : 'Unknown error'),
    }, {
      status: 500,
    });
  }
}
