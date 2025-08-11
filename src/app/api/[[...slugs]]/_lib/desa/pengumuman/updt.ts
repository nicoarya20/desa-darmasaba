import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Context } from "elysia";

type FormUpdate = Prisma.PengumumanGetPayload<{
  select: {
    id: true;
    judul: true;
    deskripsi: true;
    content: true;
    categoryPengumumanId: true;
  };
}>;

async function pengumumanUpdate(context: Context) {
  try {
    const id = context.params?.id as string; // ambil dari URL
    const body = (await context.body) as Omit<FormUpdate, "id">;
  
    const {
      judul,
      deskripsi,
      content,
      categoryPengumumanId,
    } = body;
  
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "ID tidak boleh kosong" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  
    const existing = await prisma.pengumuman.findUnique({
      where: { id },
      include: {
        CategoryPengumuman: true,
      },
    });
  
    if (!existing) {
      return new Response(
        JSON.stringify({ success: false, message: "pengumuman tidak ditemukan" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  
    const updated = await prisma.pengumuman.update({
      where: { id },
      data: {
        judul,
        deskripsi,
        content,
        categoryPengumumanId: categoryPengumumanId || null,
      },
    });
  
    return new Response(
      JSON.stringify({
        success: true,
        message: "pengumuman berhasil diupdate",
        data: updated,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error updating pengumuman:", error); 
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengupdate pengumuman",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
  export default pengumumanUpdate;
