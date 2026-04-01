import prisma from "@/lib/prisma";
import lambangDesa from "../../../data/desa/profile/lambang_desa.json";
import maskotDesa from "../../../data/desa/profile/maskot_desa.json";
import profilePerbekel from "../../../data/desa/profile/profil_perbekel.json";
import profileDesaImage from "../../../data/desa/profile/profileDesaImage.json";
import sejarahDesa from "../../../data/desa/profile/sejarah_desa.json";
import visiMisiDesa from "../../../data/desa/profile/visi_misi_desa.json";

export async function seedProfileDesa() {
  // =========== SEJARAH DESA ===========
  for (const l of sejarahDesa) {
    await prisma.sejarahDesa.upsert({
      where: {
        id: l.id,
      },
      update: {
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
      create: {
        id: l.id,
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
    });
  }

  console.log("sejarah desa success ...");

  // =========== VISI MISI DESA ===========
  for (const l of visiMisiDesa) {
    await prisma.visiMisiDesa.upsert({
      where: {
        id: l.id,
      },
      update: {
        visi: l.visi,
        misi: l.misi,
      },
      create: {
        id: l.id,
        visi: l.visi,
        misi: l.misi,
      },
    });
  }

  console.log("visi misi desa success ...");

  // =========== MASKOT DESA ===========
  for (const l of maskotDesa) {
    await prisma.maskotDesa.upsert({
      where: {
        id: l.id,
      },
      update: {
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
      create: {
        id: l.id,
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
    });
  }

  console.log("maskot desa success ...");

  console.log("🔄 Seeding Profile Desa Image...");
  for (const m of profileDesaImage) {
    let imageId: string | null = null;

    if (m.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: m.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for profile desa image "${m.label}": ${m.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.profileDesaImage.upsert({
      where: { id: m.id },
      update: {
        label: m.label,
        maskotDesaId: m.maskotDesaId,
        imageId,
      },
      create: {
        id: m.id,
        label: m.label,
        maskotDesaId: m.maskotDesaId,
        imageId,
      },
    });
  }

  console.log("profile desa image success ...");

  // =========== LAMBANG DESA ===========
  for (const l of lambangDesa) {
    await prisma.lambangDesa.upsert({
      where: {
        id: l.id,
      },
      update: {
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
      create: {
        id: l.id,
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
    });
  }

  console.log("lambang desa success ...");

  // ===========  PROFILE PERBEKEL PROFILE DESA ===========
  console.log("🔄 Seeding Profile Perbekel...");
  for (const m of profilePerbekel) {
    let imageId: string | null = null;

    if (m.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: m.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for profile perbekel "${m.biodata}": ${m.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.profilPerbekel.upsert({
      where: { id: m.id },
      update: {
        biodata: m.biodata,
        pengalaman: m.pengalaman,
        pengalamanOrganisasi: m.pengalamanOrganisasi,
        programUnggulan: m.programUnggulan,
        imageId,
      },
      create: {
        id: m.id,
        biodata: m.biodata,
        pengalaman: m.pengalaman,
        pengalamanOrganisasi: m.pengalamanOrganisasi,
        programUnggulan: m.programUnggulan,
        imageId,
      },
    });
  }

  console.log("profile perbekel desa success ...");
}