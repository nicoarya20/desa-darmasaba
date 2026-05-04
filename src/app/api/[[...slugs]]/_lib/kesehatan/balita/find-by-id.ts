import prisma from "@/lib/prisma";
import { Context } from "elysia";

export default async function balitaFindById(context: Context) {
  const id = context.params?.id as string;

  if (!id) {
    return new Response(JSON.stringify({ success: false, message: "ID tidak boleh kosong" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await prisma.balita.findUnique({
      where: { id },
      include: { posyandu: { select: { id: true, name: true } } },
    });

    if (!data) {
      return new Response(JSON.stringify({ success: false, message: "Data tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("balitaFindById error:", error);
    return new Response(JSON.stringify({ success: false, message: "Gagal mengambil data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
