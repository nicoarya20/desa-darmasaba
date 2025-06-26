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

const fasilitasKesehatanCreate = async (context: Context) => {
  const body = await context.body as FasilitasKesehatanInput;

  const {
    name,
    informasiUmum,
    layananUnggulan,
    dokterdanTenagaMedis,
    fasilitasPendukung,
    prosedurPendaftaran,
    tarifDanLayanan,
  } = body;

  // Buat masing-masing relasi terlebih dahulu
  const [createdInformasiUmum, createdLayananUnggulan, createdDokter, createdPendukung, createdProsedur, createdTarif] = await Promise.all([
    prisma.informasiUmum.create({ data: informasiUmum }),
    prisma.layananUnggulan.create({ data: layananUnggulan }),
    prisma.dokterdanTenagaMedis.create({ data: dokterdanTenagaMedis }),
    prisma.fasilitasPendukung.create({ data: fasilitasPendukung }),
    prisma.prosedurPendaftaran.create({ data: prosedurPendaftaran }),
    prisma.tarifDanLayanan.create({ data: tarifDanLayanan }),
  ]);

  const fasilitas = await prisma.fasilitasKesehatan.create({
    data: {
      name,
      informasiUmumId: createdInformasiUmum.id,
      layananUnggulanId: createdLayananUnggulan.id,
      dokterdanTenagaMedisId: createdDokter.id,
      fasilitasPendukungId: createdPendukung.id,
      prosedurPendaftaranId: createdProsedur.id,
      tarifDanLayananId: createdTarif.id,
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
