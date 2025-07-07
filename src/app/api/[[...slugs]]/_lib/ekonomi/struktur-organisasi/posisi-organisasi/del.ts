import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function posisiOrganisasiDelete(context: Context) {
  const { id } = context.params as { id: string };
  
  if (!id) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "ID wajib diisi",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Check if the position exists first
    const existing = await prisma.posisiOrganisasi.findUnique({
      where: { id },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Posisi organisasi tidak ditemukan",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if there are any pegawai associated with this position
    const pegawaiCount = await prisma.pegawai.count({
      where: { posisiId: id },
    });

    if (pegawaiCount > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Tidak dapat menghapus posisi yang masih memiliki pegawai",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if this position is used in any hubungan organisasi
    const hubunganCount = await prisma.hubunganOrganisasi.count({
      where: {
        OR: [
          { atasanId: id },
          { bawahanId: id },
        ],
      },
    });

    if (hubunganCount > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Tidak dapat menghapus posisi yang masih terdaftar dalam struktur organisasi",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // If all checks pass, delete the position
    const deleted = await prisma.posisiOrganisasi.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Posisi organisasi berhasil dihapus",
        data: deleted,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error delete posisi organisasi:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat menghapus posisi organisasi",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
