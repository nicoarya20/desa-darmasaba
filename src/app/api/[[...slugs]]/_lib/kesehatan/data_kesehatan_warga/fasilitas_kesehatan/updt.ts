import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FasilitasKesehatanInput = {
  name: string;
  informasiUmum: { fasilitas: string; alamat: string; jamOperasional: string };
  layananUnggulan: { content: string };
  dokterdanTenagaMedis: { name: string; specialist: string; jadwal: string };
  fasilitasPendukung: { content: string };
  prosedurPendaftaran: { content: string };
  tarifDanLayanan: { layanan: string; tarif: string };
};

const fasilitasKesehatanUpdate = async (context: Context) => {
  const id = context.params?.id as string;
  const body = await context.body as FasilitasKesehatanInput;

  if (!id) {
    return new Response(
      JSON.stringify({ success: false, message: "ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const existing = await prisma.fasilitasKesehatan.findUnique({
    where: { id },
  });

  if (!existing) {
    return new Response(
      JSON.stringify({ success: false, message: "Data not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    name,
    informasiUmum,
    layananUnggulan,
    dokterdanTenagaMedis,
    fasilitasPendukung,
    prosedurPendaftaran,
    tarifDanLayanan,
  } = body;

  // Update data masing-masing relasi
  await Promise.all([
    prisma.informasiUmum.update({
      where: { id: existing.informasiUmumId },
      data: informasiUmum,
    }),
    prisma.layananUnggulan.update({
      where: { id: existing.layananUnggulanId },
      data: layananUnggulan,
    }),
    prisma.dokterdanTenagaMedis.update({
      where: { id: existing.dokterdanTenagaMedisId },
      data: dokterdanTenagaMedis,
    }),
    prisma.fasilitasPendukung.update({
      where: { id: existing.fasilitasPendukungId },
      data: fasilitasPendukung,
    }),
    prisma.prosedurPendaftaran.update({
      where: { id: existing.prosedurPendaftaranId },
      data: prosedurPendaftaran,
    }),
    prisma.tarifDanLayanan.update({
      where: { id: existing.tarifDanLayananId },
      data: tarifDanLayanan,
    }),
  ]);

  // Update main record
  const updated = await prisma.fasilitasKesehatan.update({
    where: { id },
    data: { name },
    include: {
      informasiumum: true,
      layananunggulan: true,
      dokterdantenagamedis: true,
      fasilitaspendukung: true,
      prosedurpendaftaran: true,
      tarifdanlayanan: true,
    },
  });

  return {
    success: true,
    message: "Fasilitas berhasil diupdate",
    data: updated,
  };
};

export default fasilitasKesehatanUpdate;
