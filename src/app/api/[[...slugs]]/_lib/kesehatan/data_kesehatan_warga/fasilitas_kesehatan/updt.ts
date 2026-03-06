import prisma from "@/lib/prisma";
import { Context } from "elysia";

type FasilitasKesehatanInput = {
  name: string;
  informasiUmum: { fasilitas: string; alamat: string; jamOperasional: string };
  layananUnggulan: { content: string };
  dokterdanTenagaMedis: string[]; // ← ID saja
  fasilitasPendukung: { content: string };
  prosedurPendaftaran: { content: string };
  tarifDanLayanan: string[]; // ← ID saja
};

const fasilitasKesehatanUpdate = async (context: Context) => {
  const id = context.params?.id as string;
  const body = (await context.body) as FasilitasKesehatanInput;

  const existing = await prisma.fasilitasKesehatan.findUnique({
    where: { id },
    include: {
      dokterdantenagamedis: true,
      tarifdanlayanan: true,
    },
  });

  if (!existing) {
    return { success: false, message: "Data tidak ditemukan" };
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

  // update relasi 1-1
  await Promise.all([
    prisma.informasiUmum.update({
      where: { id: existing.informasiUmumId },
      data: informasiUmum,
    }),

    prisma.layananUnggulan.update({
      where: { id: existing.layananUnggulanId },
      data: layananUnggulan,
    }),

    prisma.fasilitasPendukung.update({
      where: { id: existing.fasilitasPendukungId },
      data: fasilitasPendukung,
    }),

    prisma.prosedurPendaftaran.update({
      where: { id: existing.prosedurPendaftaranId },
      data: prosedurPendaftaran,
    }),
  ]);

  // update m2m
  const updated = await prisma.fasilitasKesehatan.update({
    where: { id },

    data: {
      name,

      // reset dokter lama → ganti baru
      dokterdantenagamedis: {
        set: dokterdanTenagaMedis.map((id) => ({ id })),
      },

      tarifdanlayanan: {
        set: tarifDanLayanan.map((id) => ({ id })),
      },
    },

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
    message: "Fasilitas diupdate",
    data: updated,
  };
};

export default fasilitasKesehatanUpdate;
