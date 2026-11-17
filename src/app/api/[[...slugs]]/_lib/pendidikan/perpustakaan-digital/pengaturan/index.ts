import Elysia, { t } from "elysia";
import { guardAdmin } from "../../../landing_page/desa-anti-korupsi/admin-guard";
import perpustakaanPengaturanFind from "./find";
import perpustakaanPengaturanUpdate from "./updt";

export const PESAN_PENGATURAN_BUKAN_ADMIN = "Hanya admin yang boleh mengubah pengaturan perpustakaan";

// GET publik (halaman penghubung). PUT: guard global route.ts hanya memastikan login, padahal URL ini dirender
// sebagai tautan publik — user Google biasa (role 5) tidak boleh menggantinya, jadi dicek role admin di sini.
const PengaturanPerpustakaan = new Elysia({
  prefix: "/pengaturan",
  tags: ["Pendidikan / Perpustakaan Digital / Pengaturan Website"],
})
  .get("/find", perpustakaanPengaturanFind)
  .put("/update", perpustakaanPengaturanUpdate, {
    beforeHandle: async ({ set }) => (await guardAdmin(set, PESAN_PENGATURAN_BUKAN_ADMIN)) ?? undefined,
    body: t.Object({
      namaPlatform: t.String(),
      deskripsi: t.String(),
      websiteUrl: t.String(),
    }),
  });

export default PengaturanPerpustakaan;
