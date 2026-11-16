import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FormCreate = {
  name: string;
  tanggal: string;
  namaOrangtua: string;
  nomor: string;
  alamat: string;
  catatan: string;
};
async function createPendaftaran(context: Context) {
  const body = context.body as FormCreate;

  const result = await prisma.pendaftaranJadwalKegiatan.create({
    data: {
      name: body.name,
      tanggal: body.tanggal,
      namaOrangtua: body.namaOrangtua,
      nomor: body.nomor,
      alamat: body.alamat,
      catatan: body.catatan,
    },
    select: { id: true },
  });
  // Hanya id: endpoint form publik, jangan gemakan nama anak/orang tua/alamat ke respons.
  return {
    success: true,
    message: "Sukses menambahkan pendaftaran jadwal kegiatan",
    data: { id: result.id },
  };
}
export default createPendaftaran;
