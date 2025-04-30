import Elysia, { t } from "elysia";
import informasiJadwalKegiatanFindMany from "./find-many";
import informasiJadwalKegiatanCreate from "./create";

const InformasiJadwalKegiatan = new Elysia({
  prefix: "/informasiJadwalKegiatan",
  tags: ["Data Kesehatan/Jadwal Kegiatan/Informasi Kegiatan"],
})
.get("/find-many", informasiJadwalKegiatanFindMany)
.post("/create", informasiJadwalKegiatanCreate, {
  body: t.Object({
    name: t.String(),
    tanggal: t.String(),
    waktu: t.String(),
    lokasi: t.String(),
  }),
})

export default InformasiJadwalKegiatan