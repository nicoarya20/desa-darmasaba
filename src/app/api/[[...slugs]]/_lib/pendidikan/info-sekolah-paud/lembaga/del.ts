import prisma from "@/lib/prisma";
import { Context } from "elysia";

// Soft-delete (isActive:false), bukan hard delete — konsisten dgn findMany
// yang memfilter isActive:true, dan mengikuti pola kanonik desa/banjar/del.ts.
// Hard delete sebelumnya melempar P2003 (FK Siswa/Pengajar) yang diserialisasi
// Elysia jadi 500 plaintext -> frontend .json() meledak SyntaxError.
export default async function lembagaPendidikanDelete(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return Response.json(
        { success: false, message: "ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Aturan bisnis: jangan sembunyikan lembaga yang masih dipakai siswa/pengajar aktif.
    const [siswaCount, pengajarCount] = await Promise.all([
      prisma.siswa.count({ where: { lembagaId: id, isActive: true } }),
      prisma.pengajar.count({ where: { lembagaId: id, isActive: true } }),
    ]);

    if (siswaCount > 0 || pengajarCount > 0) {
      const pemakai: string[] = [];
      if (siswaCount > 0) pemakai.push(`${siswaCount} siswa`);
      if (pengajarCount > 0) pemakai.push(`${pengajarCount} pengajar`);
      return Response.json(
        {
          success: false,
          message: `Lembaga pendidikan tidak dapat dihapus karena masih digunakan oleh ${pemakai.join(
            " dan "
          )}`,
        },
        { status: 400 }
      );
    }

    await prisma.lembaga.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: "Berhasil menghapus lembaga pendidikan" };
  } catch (error) {
    console.error("Delete lembaga pendidikan error:", error);
    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus lembaga pendidikan: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
