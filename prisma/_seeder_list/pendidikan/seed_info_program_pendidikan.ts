import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const tujuanProgram = loadJsonData("pendidikan/program-pendidikan-anak/tujuan-program.json");
const programUnggulan = loadJsonData("pendidikan/program-pendidikan-anak/program-unggulan.json");

export async function seedInfoProgramPendidikan() {
  for (const t of tujuanProgram) {
    await prisma.tujuanProgram.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log("✅ tujuan program seeded (editable later via UI)");
  for (const t of programUnggulan) {
    await prisma.programUnggulan.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log("✅ program unggulan seeded (editable later via UI)");
}
