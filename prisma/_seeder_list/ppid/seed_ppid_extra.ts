import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const strukturOrganisasiPpidJson = loadJsonData("ppid/struktur-organisasi-ppid/struktur-organisasi-ppid.json");
const formulirPermohonanKeberatanJson = loadJsonData("ppid/formulir-permohonan-keberatan/formulir-permohonan-keberatan.json");
const ikmJson = loadJsonData("ppid/ikm/indeks-kepuasan-masyarakat/indeks-kepuasan-masyarakat.json");
const grafikJenisKelaminJson = loadJsonData("ppid/ikm/grafik-jenis-kelamin/grafik-jenis-kelamin.json");
const grafikRespondenJson = loadJsonData("ppid/ikm/grafik-responden/grafik-responden.json");
const grafikUmurJson = loadJsonData("ppid/ikm/grafik-umur/grafik-umur.json");

export async function seedStrukturOrganisasiPpid() {
  console.log("🔄 Seeding StrukturOrganisasiPPID...");

  for (const item of strukturOrganisasiPpidJson) {
    await prisma.strukturOrganisasiPPID.upsert({
      where: { id: item.id },
      update: {
        posisiOrganisasiId: item.posisiOrganisasiId,
        pegawaiId: item.pegawaiId,
        hubunganOrganisasiId: item.hubunganOrganisasiId,
      },
      create: {
        id: item.id,
        posisiOrganisasiId: item.posisiOrganisasiId,
        pegawaiId: item.pegawaiId,
        hubunganOrganisasiId: item.hubunganOrganisasiId,
      },
    });

    console.log(`✅ StrukturOrganisasiPPID seeded: ${item.id}`);
  }

  console.log("🎉 StrukturOrganisasiPPID seed selesai");
}

export async function seedFormulirPermohonanKeberatan() {
  console.log("🔄 Seeding FormulirPermohonanKeberatan...");

  for (const item of formulirPermohonanKeberatanJson) {
    await prisma.formulirPermohonanKeberatan.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        email: item.email,
        notelp: item.notelp,
        alasan: item.alasan,
      },
      create: {
        id: item.id,
        name: item.name,
        email: item.email,
        notelp: item.notelp,
        alasan: item.alasan,
      },
    });

    console.log(`✅ FormulirPermohonanKeberatan seeded: ${item.name}`);
  }

  console.log("🎉 FormulirPermohonanKeberatan seed selesai");
}

export async function seedIndeksKepuasanMasyarakat() {
  console.log("🔄 Seeding IndeksKepuasanMasyarakat...");

  for (const item of ikmJson) {
    await prisma.indeksKepuasanMasyarakat.upsert({
      where: { id: item.id },
      update: {
        label: item.label,
        kepuasan: item.kepuasan,
      },
      create: {
        id: item.id,
        label: item.label,
        kepuasan: item.kepuasan,
      },
    });

    console.log(`✅ IndeksKepuasanMasyarakat seeded: ${item.label}`);
  }

  console.log("🎉 IndeksKepuasanMasyarakat seed selesai");
}

export async function seedGrafikBerdasarkanJenisKelamin() {
  console.log("🔄 Seeding GrafikBerdasarkanJenisKelamin...");

  for (const item of grafikJenisKelaminJson) {
    await prisma.grafikBerdasarkanJenisKelamin.upsert({
      where: { id: item.id },
      update: {
        perempuan: item.perempuan,
        laki: item.laki,
      },
      create: {
        id: item.id,
        perempuan: item.perempuan,
        laki: item.laki,
      },
    });

    console.log(`✅ GrafikBerdasarkanJenisKelamin seeded: ${item.id}`);
  }

  console.log("🎉 GrafikBerdasarkanJenisKelamin seed selesai");
}

export async function seedGrafikBerdasarkanResponden() {
  console.log("🔄 Seeding GrafikBerdasarkanResponden...");

  for (const item of grafikRespondenJson) {
    await prisma.grafikBerdasarkanResponden.upsert({
      where: { id: item.id },
      update: {
        sangatbaik: item.sangatbaik,
        baik: item.baik,
        kurangbaik: item.kurangbaik,
        tidakbaik: item.tidakbaik,
      },
      create: {
        id: item.id,
        sangatbaik: item.sangatbaik,
        baik: item.baik,
        kurangbaik: item.kurangbaik,
        tidakbaik: item.tidakbaik,
      },
    });

    console.log(`✅ GrafikBerdasarkanResponden seeded: ${item.id}`);
  }

  console.log("🎉 GrafikBerdasarkanResponden seed selesai");
}

export async function seedGrafikBerdasarkanUmur() {
  console.log("🔄 Seeding GrafikBerdasarkanUmur...");

  for (const item of grafikUmurJson) {
    await prisma.grafikBerdasarkanUmur.upsert({
      where: { id: item.id },
      update: {
        remaja: item.remaja,
        dewasa: item.dewasa,
        orangtua: item.orangtua,
        lansia: item.lansia,
      },
      create: {
        id: item.id,
        remaja: item.remaja,
        dewasa: item.dewasa,
        orangtua: item.orangtua,
        lansia: item.lansia,
      },
    });

    console.log(`✅ GrafikBerdasarkanUmur seeded: ${item.id}`);
  }

  console.log("🎉 GrafikBerdasarkanUmur seed selesai");
}
