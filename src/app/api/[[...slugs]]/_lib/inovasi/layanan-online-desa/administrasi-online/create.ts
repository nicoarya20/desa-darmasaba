import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  name: string;
  alamat: string;
  nomorTelepon: string;
  jenisLayananId: string;
};

export default async function administrasiOnlineCreate(context: Context) {
  const body = context.body as FormCreate;

  if (!body.jenisLayananId) {
    throw new Error("jenisLayananId wajib diisi");
  }

  try {
    // Create langsung data AdministrasiOnline
    const result = await prisma.administrasiOnline.create({
      data: {
        name: body.name,
        alamat: body.alamat,
        nomorTelepon: body.nomorTelepon,
        jenisLayananId: body.jenisLayananId, // relasi ke JenisLayanan
      },
      select: { id: true },
    });

    // Hanya id: endpoint publik, jangan gemakan nama/alamat/nomor telepon pemohon ke respons.
    return {
      success: true,
      message: "Berhasil membuat administrasi online",
      data: { id: result.id },
    };
  } catch (error) {
    console.error("Error creating administrasi online:", error);
    throw new Error(
      "Gagal membuat administrasi online: " + (error as Error).message
    );
  }
}
