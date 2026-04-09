import prisma from "@/lib/prisma";
import type { Context } from "elysia";

export default async function pejabatDesaFindUnique(context: Context) {
  try {
    const id = context.params?.id as string;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "ID tidak boleh kosong",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const existing = await prisma.pejabatDesa.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Data tidak ditemukan",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Data pejabat desa berhasil ditemukan",
        data: existing,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching pejabat desa:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengambil data pejabat desa",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
