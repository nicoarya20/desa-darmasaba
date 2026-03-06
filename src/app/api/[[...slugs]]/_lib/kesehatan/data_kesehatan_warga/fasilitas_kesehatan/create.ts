import prisma from "@/lib/prisma";
import { Context } from "elysia";

const fasilitasKesehatanCreate = async (context: Context) => {
  const body = (await context.body) as {
    name: string;
    informasiUmum: { fasilitas: string; alamat: string; jamOperasional: string };
    layananUnggulan: { content: string };
    dokterdanTenagaMedis: string[]; // ← ARRAY OF ID
    fasilitasPendukung: { content: string };
    prosedurPendaftaran: { content: string };
    tarifDanLayanan: string[]; // ← ARRAY OF ID
  };

  const {
    name,
    informasiUmum,
    layananUnggulan,
    dokterdanTenagaMedis,
    fasilitasPendukung,
    prosedurPendaftaran,
    tarifDanLayanan,
  } = body;

  // CREATE SINGLE DATA
  const [createdInformasi, createdUnggulan, createdPendukung, createdProsedur] =
    await Promise.all([
      prisma.informasiUmum.create({ data: informasiUmum }),
      prisma.layananUnggulan.create({ data: layananUnggulan }),
      prisma.fasilitasPendukung.create({ data: fasilitasPendukung }),
      prisma.prosedurPendaftaran.create({ data: prosedurPendaftaran }),
    ]);

  // ✅ CUKUP CONNECT KE ID YANG SUDAH ADA
  const fasilitas = await prisma.fasilitasKesehatan.create({
    data: {
      name,
      informasiUmumId: createdInformasi.id,
      layananUnggulanId: createdUnggulan.id,
      fasilitasPendukungId: createdPendukung.id,
      prosedurPendaftaranId: createdProsedur.id,

      dokterdantenagamedis: {
        connect: dokterdanTenagaMedis.map(id => ({ id })), // ← langsung dari input
      },
      tarifdanlayanan: {
        connect: tarifDanLayanan.map(id => ({ id })), // ← langsung dari input
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
    message: "Fasilitas berhasil dibuat",
    data: fasilitas,
  };
};

export default fasilitasKesehatanCreate;
