import Elysia, { t } from "elysia";
import { guardAdmin } from "../../landing_page/desa-anti-korupsi/admin-guard";
import profilLembagaPPIDFind from "./find";
import { PESAN_PROFIL_LEMBAGA_BUKAN_ADMIN, PROFIL_LEMBAGA_MAX_TEXT } from "./profil-lembaga.shape";
import profilLembagaPPIDUpdate from "./update";

const teksOpsional = t.Optional(t.Nullable(t.String({ maxLength: PROFIL_LEMBAGA_MAX_TEXT })));

// GET publik (halaman /ppid/profil-ppid). PUT: guard global route.ts hanya memastikan login, jadi role admin dicek di sini.
const ProfilLembagaPPID = new Elysia({
  prefix: "/profillembagappid",
  tags: ["PPID/Profil Lembaga PPID"],
})
  .get("/find", profilLembagaPPIDFind)
  .put("/update", profilLembagaPPIDUpdate, {
    beforeHandle: async ({ set }) => (await guardAdmin(set, PESAN_PROFIL_LEMBAGA_BUKAN_ADMIN)) ?? undefined,
    body: t.Object({
      deskripsi: teksOpsional,
      tujuan: teksOpsional,
      tugasFungsi: teksOpsional,
      gambarAlurId: t.Optional(t.Nullable(t.String())),
    }),
  });

export default ProfilLembagaPPID;
