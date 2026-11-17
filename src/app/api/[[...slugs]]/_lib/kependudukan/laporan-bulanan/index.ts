import Elysia, { t } from "elysia";
import laporanBulananCreate from "./create";
import laporanBulananDelete from "./del";
import laporanBulananFindMany from "./findMany";
import laporanBulananFindUnique from "./findUnique";
import laporanBulananUpdate from "./updt";

// Tipe dasar saja; rentang & bulat/tidaknya angka divalidasi di parseLaporanInput supaya pesan galat seragam.
const laporanBody = t.Object({
  banjar: t.String(),
  tahun: t.Number(),
  bulan: t.Number(),
  lakiLaki: t.Number(),
  perempuan: t.Number(),
});

// GET publik (agregat per banjar per bulan, tanpa data pribadi). Mutasi: guard global route.ts hanya memastikan
// login, jadi role admin (0-4) dicek di tiap handler lewat guardMutasi.
const LaporanBulanan = new Elysia({
  prefix: "/laporanbulanan",
  tags: ["Kependudukan/Laporan Bulanan"],
})
  .get("/find-many", laporanBulananFindMany)
  .get("/:id", laporanBulananFindUnique)
  .post("/create", laporanBulananCreate, { body: laporanBody })
  .put("/:id", laporanBulananUpdate, { body: laporanBody })
  .delete("/del/:id", laporanBulananDelete);

export default LaporanBulanan;
