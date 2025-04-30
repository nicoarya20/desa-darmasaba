import Elysia, { t } from "elysia";
import deskripsiJadwalKegiatanFindMany from "./find-many";
import deskripsiJadwalKegiatanCreate from "./create";

const DeskripsiJadwalKegiatan = new Elysia({
    prefix: "/deskripsikegiatan",
    tags: ["Data Kesehatan/Jadwal Kegiatan/Deskripsi Kegiatan"],
})
.get("/find-many", deskripsiJadwalKegiatanFindMany)
.post("/create", deskripsiJadwalKegiatanCreate, {
    body: t.Object({
        deskripsi: t.String(),
    }),
})

export default DeskripsiJadwalKegiatan
