import prisma from "@/lib/prisma";
import profilPpd from "../../../data/ppid/profile-ppid/profilePPid.json"

export async function seedProfilPpd() {
  console.log("🔄 Seeding Profil PPD...");
  for (const m of profilPpd) {
    let imageId: string | null = null;

    if (m.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: m.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for berita "${m.name}": ${m.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.profilePPID.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        biodata: m.biodata,
        riwayat: m.riwayat,
        pengalaman: m.pengalaman,
        unggulan: m.unggulan,
        imageId,
      },
      create: {
        id: m.id,
        name: m.name,
        biodata: m.biodata,
        riwayat: m.riwayat,
        pengalaman: m.pengalaman,
        unggulan: m.unggulan,
        imageId,
      },
    });
  }

  console.log("profil ppd success ...");
}
  