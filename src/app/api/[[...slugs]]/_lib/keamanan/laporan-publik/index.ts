import Elysia, { t } from "elysia";
import laporanPublikCreate from "./create";
import laporanPublikFindMany from "./findMany";
import laporanPublikFindUnique from "./findUnique";
import laporanPublikUpdate from "./updt";
import laporanPublikDelete from "./del";

const LaporanPublik = new Elysia({
  prefix: "laporanpublik",
  tags: ["Keamanan/Laporan Publik"],
})
  .post("/create", laporanPublikCreate, {
    body: t.Object({
      judul: t.String(),
      lokasi: t.String(),
      tanggalWaktu: t.String(), // ISO string
      status: t.Union([
        t.Literal("SELESAI"),
        t.Literal("PROSES"),
        t.Literal("GAGAL"),
      ]),
      penanganan: t.Array(t.String()), // 🛠️ ARRAY of strings
      kronologi: t.Optional(t.String()),
    }),
  })
  .get("/find-many", laporanPublikFindMany)
  .get("/:id", laporanPublikFindUnique)
  .put("/:id", laporanPublikUpdate, {
    body: t.Object({
      judul: t.String(),
      lokasi: t.String(),
      tanggalWaktu: t.String(), // ISO string
      status: t.Union([
        t.Literal("SELESAI"),
        t.Literal("PROSES"),
        t.Literal("GAGAL"),
      ]),
      penanganan: t.Array(t.String()), // 🛠️ ARRAY of strings
      kronologi: t.Optional(t.String()),
    }),
  })
  .delete("/del/:id", laporanPublikDelete);
export default LaporanPublik;
