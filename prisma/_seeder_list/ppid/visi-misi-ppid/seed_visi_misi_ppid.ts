import prisma from "@/lib/prisma";
import visiMisiPPID from "../../../data/ppid/visi-misi-ppid/visimisiPPID.json"

export async function seedVisiMisiPpid() {
     for (const v of visiMisiPPID) {
    await prisma.visiMisiPPID.upsert({
      where: {
        id: v.id,
      },
      update: {
        misi: v.misi,
        visi: v.visi,
      },
      create: {
        id: v.id,
        misi: v.misi,
        visi: v.visi,
      },
    });
  }
  console.log("visi misi PPID success ...");

}