import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const dasarHukumPPID = loadJsonData("ppid/dasar-hukum-ppid/dasarhukumPPID.json");

export async function seedDasarHukumPpid() {
  for (const v of dasarHukumPPID) {
    await prisma.dasarHukumPPID.upsert({
      where: {
        id: v.id,
      },
      update: {
        judul: v.judul,
        content: v.content,
      },
      create: {
        id: v.id,
        judul: v.judul,
        content: v.content,
      },
    });
  }
  console.log("dasar hukum PPID success ...");
}