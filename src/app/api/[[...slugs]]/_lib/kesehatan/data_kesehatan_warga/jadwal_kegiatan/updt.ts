import prisma from "@/lib/prisma";
import { Context } from "elysia";

type JadwalKegiatanUpdateInput = {
  content: string;
  informasiJadwalKegiatan: {
    name: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
  };
  deskripsiJadwalKegiatan: { deskripsi: string };
  layananJadwalKegiatan: { content: string };
  syaratKetentuanJadwalKegiatan: { content: string };
  dokumenJadwalKegiatan: { content: string };
  pendaftaranJadwalKegiatan: {
    name: string;
    tanggal: string;
    namaOrangtua: string;
    nomor: string;
    alamat: string;
    catatan: string;
  };
};

const jadwalKegiatanUpdate = async (context: Context) => {
  const id = context.params?.id as string;
  const body = (await context.body) as JadwalKegiatanUpdateInput;

  if (!id) {
    return new Response(
      JSON.stringify({ success: false, message: "ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const existing = await prisma.jadwalKegiatan.findUnique({ where: { id } });

  if (!existing) {
    return new Response(
      JSON.stringify({ success: false, message: "Data not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    content,
    informasiJadwalKegiatan,
    deskripsiJadwalKegiatan,
    layananJadwalKegiatan,
    syaratKetentuanJadwalKegiatan,
    dokumenJadwalKegiatan,
    pendaftaranJadwalKegiatan,
  } = body;

 await Promise.all([
    prisma.informasiJadwalKegiatan.update({ 
        where: { id: existing.informasiJadwalKegiatanId }, 
        data: informasiJadwalKegiatan 
    }),
    prisma.deskripsiJadwalKegiatan.update({ 
        where: { id: existing.deskripsiJadwalKegiatanId }, 
        data: deskripsiJadwalKegiatan 
    }),
    prisma.layananJadwalKegiatan.update({ 
        where: { id: existing.layananJadwalKegiatanId }, 
        data: layananJadwalKegiatan 
    }),
    prisma.syaratKetentuanJadwalKegiatan.update({
      where: { id: existing.syaratKetentuanJadwalKegiatanId },
      data: syaratKetentuanJadwalKegiatan,
    }),
    prisma.dokumenJadwalKegiatan.update({ 
        where: { id: existing.dokumenJadwalKegiatanId }, 
        data: dokumenJadwalKegiatan 
    }),
    prisma.pendaftaranJadwalKegiatan.update({
      where: { id: existing.pendaftaranJadwalKegiatanId },
      data: pendaftaranJadwalKegiatan,
    }),
  ]);

  const updated = await prisma.jadwalKegiatan.update({
    where: { id },
    data: {
      content,
    },
    include: {
      informasijadwalkegiatan: true,
      deskripsijadwalkegiatan: true,
      layananjadwalkegiatan: true,
      syaratketentuanjadwalkegiatan: true,
      dokumenjadwalkegiatan: true,
      pendaftaranjadwalkegiatan: true,
    },
  });
  return {
    success: true,
    message: "Success update jadwal kegiatan",
    data: updated,
  };
};
export default jadwalKegiatanUpdate;
